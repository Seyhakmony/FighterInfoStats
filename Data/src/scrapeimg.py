import csv
import json
import re
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse
from typing import Dict, List, Optional

import pandas as pd
import requests
from bs4 import BeautifulSoup


class UFCScraperConfig:
    """Configuration settings for the scraper"""
    BASE_URL = "https://www.ufc.com"
    ATHLETES_URL = "https://www.ufc.com/athletes/all"
    
    # Request settings
    REQUEST_DELAY = 0.5  # seconds between requests
    TIMEOUT = 30
    MAX_RETRIES = 3
    
    # File paths
    OUTPUT_CSV = "ufc_fighters.csv"
    OUTPUT_JSON = "ufc_fighters.json"
    LOGS_DIR = Path("logs")
    
    # User agent to appear as regular browser
    HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }


class UFCFighterScraper:
    """Main scraper class for UFC fighter names and images"""
    
    def __init__(self, config: UFCScraperConfig = None):
        self.config = config or UFCScraperConfig()
        self.session = requests.Session()
        self.session.headers.update(self.config.HEADERS)
        
        # Create directories
        self.config.LOGS_DIR.mkdir(exist_ok=True)
        
        # Storage for scraped data
        self.fighters_data = []
        
    def setup_logging(self):
        """Setup logging for the scraper"""
        import logging
        
        log_file = self.config.LOGS_DIR / f"ufc_scraper_{int(time.time())}.log"
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def get_fighter_profile_links(self) -> List[str]:
        
        print("🔍 Discovering all fighter profile links...")
        
        fighter_links = set()
        page = 0

        while True:
            url = f"{self.config.ATHLETES_URL}?page={page}"
            try:
                print(f"📄 Scanning page {page + 1} -> {url}")
                response = self.session.get(url, timeout=self.config.TIMEOUT)
                response.raise_for_status()

                soup = BeautifulSoup(response.content, 'html.parser')

                profile_links = soup.find_all('a', href=re.compile(r'/athlete/[^/]+$'))
                if not profile_links:
                    print(f"✅ No more fighter profiles found at page {page + 1}")
                    break

                page_links = []
                for link in profile_links:
                    href = link.get('href')
                    if href and href not in fighter_links:
                        full_url = urljoin(self.config.BASE_URL, href)
                        fighter_links.add(href)
                        page_links.append(full_url)

                print(f"📊 Found {len(page_links)} new fighters (total: {len(fighter_links)})")

                if not page_links:
                    print("✅ No new fighters found, ending scan")
                    break

                page += 1
                time.sleep(self.config.REQUEST_DELAY)

            except requests.RequestException as e:
                print(f"❌ Error scanning page {page + 1}: {e}")
                break

        fighter_urls = [urljoin(self.config.BASE_URL, link) for link in fighter_links]
        print(f"🎯 Total fighter profiles discovered: {len(fighter_urls)}")
        return fighter_urls

    def extract_fighter_data(self, profile_url: str) -> Optional[Dict]:
        """Extract fighter name and image from their profile page"""
        try:
            response = self.session.get(profile_url, timeout=self.config.TIMEOUT)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract fighter name
            name = self.extract_fighter_name(soup)
            if not name:
                print(f"⚠️ Could not find name for {profile_url}")
                return None
            
            # Extract main profile image with name validation
            image_url = self.extract_main_profile_image(soup, name)
            if not image_url:
                print(f"⚠️ No profile image found for {name}")
                # Still return the fighter data even without image
                return {
                    'name': name.strip(),
                    'image_url': ''
                }
            
            return {
                'name': name.strip(),
                'image_url': image_url
            }
            
        except requests.RequestException as e:
            print(f"❌ Error fetching {profile_url}: {e}")
            return None
        except Exception as e:
            print(f"❌ Error parsing {profile_url}: {e}")
            return None
    
    def extract_fighter_name(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract fighter name from profile page"""
        # Try different selectors for fighter name
        name_selectors = [
            'h1.hero-profile__name',
            'h1.c-hero__headline',  
            '.hero-profile__name',
            '.c-hero__headline',
            'h1',
            '.fighter-name',
            '.athlete-name'
        ]
        
        for selector in name_selectors:
            name_elem = soup.select_one(selector)
            if name_elem:
                name = name_elem.get_text(strip=True)
                if name and len(name) > 1:  # Basic validation
                    return name
        
        # Fallback: try to extract from title tag
        title = soup.find('title')
        if title:
            title_text = title.get_text()
            # UFC titles often follow pattern "Fighter Name | UFC"
            if '|' in title_text:
                name = title_text.split('|')[0].strip()
                if name:
                    return name
        
        return None
    
    def validate_image_belongs_to_fighter(self, image_url: str, fighter_name: str) -> bool:
        """Check if an image URL likely belongs to the given fighter"""
        if not image_url or not fighter_name:
            return False
        
        # Convert name to potential URL patterns
        name_parts = fighter_name.lower().replace("'", "").replace("-", "_").split()
        
        # Common patterns in UFC image URLs
        name_patterns = []
        if len(name_parts) >= 2:
            # First_Last format (e.g., JOHNSON_DEMETRIOUS)
            name_patterns.append(f"{name_parts[-1]}_{name_parts[0]}".upper())
            name_patterns.append(f"{name_parts[0]}_{name_parts[-1]}".upper())
            
            # FirstLast format
            name_patterns.append(f"{name_parts[0]}{name_parts[-1]}".upper())
            name_patterns.append(f"{name_parts[-1]}{name_parts[0]}".upper())
            
            # Individual names
            for part in name_parts:
                if len(part) > 2:  # Skip short words like "de", "la", etc.
                    name_patterns.append(part.upper())
        
        # Check if any pattern matches the URL
        image_url_upper = image_url.upper()
        for pattern in name_patterns:
            if pattern in image_url_upper:
                return True
        
        return False
    
    def extract_main_profile_image(self, soup: BeautifulSoup, fighter_name: str) -> Optional[str]:
        """Extract the main profile image for the specific fighter"""
        
        # Priority 1: Look in fighter-specific containers first
        fighter_containers = [
            '.c-listing-athlete__bgimg',
            '.c-listing-athlete-flipcard__back',
            '.hero-profile',
            '.c-hero',
            '.athlete-hero',
            '.fighter-profile'
        ]
        
        for container_selector in fighter_containers:
            container = soup.select_one(container_selector)
            if container:
                img = container.find('img', src=True)
                if img:
                    src = img.get('src')
                    if src:
                        absolute_url = self.ensure_absolute_url(src)
                        # Validate this image belongs to our fighter
                        if self.validate_image_belongs_to_fighter(absolute_url, fighter_name):
                            return absolute_url
                        # If no name validation possible, still prefer container images
                        elif not any(other_name in absolute_url.upper() for other_name in ['BORG', 'SILVA', 'JONES'] if other_name not in fighter_name.upper()):
                            return absolute_url
        
        # Priority 2: Look for images with fighter-specific field names
        field_containers = [
            '.field--name-image-body-right',
            '.field--name-image',
            '.field--name-athlete-image'
        ]
        
        for field_selector in field_containers:
            field = soup.select_one(field_selector)
            if field:
                img = field.find('img', src=True)
                if img:
                    src = img.get('src')
                    if src:
                        absolute_url = self.ensure_absolute_url(src)
                        if self.validate_image_belongs_to_fighter(absolute_url, fighter_name):
                            return absolute_url
        
        # Priority 3: Look for full body profile images with name validation
        profile_patterns = [
            r'event_fight_card_upper_body_of_standing_athlete',
            r'ufc-fighter-container.*profile-galery.*fullbodyright-picture',
            r'ufc-fighter-container.*profile-gallery.*fullbodyright-picture', 
            r'profile-galery.*fullbodyright-picture',
            r'profile-gallery.*fullbodyright-picture',
            r'fullbodyright-picture'
        ]
        
        for pattern in profile_patterns:
            imgs = soup.find_all('img', src=re.compile(pattern, re.I))
            for img in imgs:
                src = img.get('src')
                if src:
                    absolute_url = self.ensure_absolute_url(src)
                    if self.validate_image_belongs_to_fighter(absolute_url, fighter_name):
                        return absolute_url
        
        # Priority 4: Look for other profile images with UFC fighter container and name validation
        container_patterns = [
            r'ufc-fighter-container',
            r'profile.*picture',
            r'athlete.*image',
            r'hero.*image'
        ]
        
        for pattern in container_patterns:
            imgs = soup.find_all('img', src=re.compile(pattern, re.I))
            for img in imgs:
                src = img.get('src')
                if src:
                    absolute_url = self.ensure_absolute_url(src)
                    if self.validate_image_belongs_to_fighter(absolute_url, fighter_name):
                        return absolute_url
        
        # Priority 5: Look in layout containers with name validation
        layout_divs = soup.find_all('div', class_=re.compile(r'layout.*content'))
        for div in layout_divs:
            img = div.find('img', src=True)
            if img:
                src = img.get('src')
                if src and any(keyword in src.lower() for keyword in ['fighter', 'athlete', 'profile']):
                    absolute_url = self.ensure_absolute_url(src)
                    if self.validate_image_belongs_to_fighter(absolute_url, fighter_name):
                        return absolute_url
        
        # Priority 6: Look for hero/main images with name validation
        hero_selectors = [
            '.hero-profile img',
            '.c-hero img',
            '.athlete-hero img',
            '.fighter-profile img'
        ]
        
        for selector in hero_selectors:
            imgs = soup.select(selector)
            for img in imgs:
                if img.get('src'):
                    absolute_url = self.ensure_absolute_url(img.get('src'))
                    if self.validate_image_belongs_to_fighter(absolute_url, fighter_name):
                        return absolute_url
        
        # Priority 7: Fallback - any reasonable looking fighter image with name validation
        all_imgs = soup.find_all('img', src=True)
        for img in all_imgs:
            src = img.get('src', '')
            # Look for images that seem like fighter photos
            if any(keyword in src.lower() for keyword in [
                'fighter', 'athlete', 'profile', 'headshot', 'portrait'
            ]) and not any(skip in src.lower() for skip in [
                'logo', 'icon', 'banner', 'background', 'thumb'
            ]):
                absolute_url = self.ensure_absolute_url(src)
                if self.validate_image_belongs_to_fighter(absolute_url, fighter_name):
                    return absolute_url
        
        # Last resort: return first container image even without name validation
        # but avoid obvious mismatches
        for container_selector in fighter_containers:
            container = soup.select_one(container_selector)
            if container:
                img = container.find('img', src=True)
                if img:
                    src = img.get('src')
                    if src:
                        absolute_url = self.ensure_absolute_url(src)
                        # Basic check to avoid obvious wrong fighters
                        suspicious_names = ['BORG_RAY', 'SILVA_', 'JONES_', 'MCGREGOR_', 'DIAZ_']
                        if not any(suspicious in absolute_url.upper() for suspicious in suspicious_names):
                            return absolute_url
        
        return None
    
    def ensure_absolute_url(self, url: str) -> str:
        """Ensure URL is absolute"""
        if not url:
            return ''
        
        if url.startswith('//'):
            return 'https:' + url
        elif url.startswith('/'):
            return urljoin(self.config.BASE_URL, url)
        elif not url.startswith('http'):
            return urljoin(self.config.BASE_URL, url)
        
        return url
    
    def scrape_all_fighters(self) -> List[Dict]:
        """Main method to scrape all fighters"""
        print("🥊 Starting UFC Fighter Image Scraper...")
        print("=" * 50)
        
        # Step 1: Get all fighter profile URLs
        profile_urls = self.get_fighter_profile_links()
        
        if not profile_urls:
            print("❌ No fighter profiles found")
            return []
        
        # Step 2: Extract data from each profile
        fighters = []
        total = len(profile_urls)
        
        for i, url in enumerate(profile_urls, 1):
            print(f"🔄 Processing fighter {i}/{total}: {url.split('/')[-1]}")
            
            fighter_data = self.extract_fighter_data(url)
            if fighter_data:
                fighters.append(fighter_data)
                print(f"✅ {fighter_data['name']} - {'✓' if fighter_data['image_url'] else '✗'}")
            
            # Progress update
            if i % 10 == 0:
                print(f"📊 Progress: {i}/{total} fighters processed...")
            
            # Be respectful with delays
            time.sleep(self.config.REQUEST_DELAY)
        
        print(f"\n🎉 Completed! Scraped {len(fighters)} fighters")
        return fighters
    
    def export_data(self, fighters: List[Dict]):
        """Export fighter data to CSV and JSON"""
        if not fighters:
            print("⚠️ No fighter data to export")
            return
        
        print(f"💾 Exporting {len(fighters)} fighters...")
        
        # Export to CSV with simple structure: name, image_url
        df = pd.DataFrame(fighters)
        df = df[['name', 'image_url']]  # Ensure only these columns
        df.to_csv(self.config.OUTPUT_CSV, index=False)
        print(f"✅ Exported to {self.config.OUTPUT_CSV}")
        
        # Export to JSON as backup
        with open(self.config.OUTPUT_JSON, 'w') as f:
            json.dump(fighters, f, indent=2)
        print(f"✅ Exported to {self.config.OUTPUT_JSON}")
        
        # Print summary
        self.print_summary(fighters)
    
    def print_summary(self, fighters: List[Dict]):
        """Print summary statistics"""
        print("\n📊 SCRAPING SUMMARY")
        print("=" * 40)
        print(f"Total fighters: {len(fighters)}")
        
        fighters_with_images = sum(1 for f in fighters if f.get('image_url'))
        fighters_without_images = len(fighters) - fighters_with_images
        
        print(f"With images: {fighters_with_images}")
        print(f"Without images: {fighters_without_images}")
        
        if fighters_with_images > 0:
            print(f"Image success rate: {fighters_with_images/len(fighters)*100:.1f}%")
        
        print("=" * 40)
        print(f"📄 Data saved to: {self.config.OUTPUT_CSV}")
    
    def run(self):
        """Main execution method"""
        self.setup_logging()
        
        try:
            fighters = self.scrape_all_fighters()
            self.export_data(fighters)
            
        except KeyboardInterrupt:
            print("\n⚠️ Scraping interrupted by user")
            if self.fighters_data:
                print("💾 Saving partial data...")
                self.export_data(self.fighters_data)
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            if self.fighters_data:
                print("💾 Saving partial data...")
                self.export_data(self.fighters_data)


def main():
    """Main entry point"""
    scraper = UFCFighterScraper()
    scraper.run()


if __name__ == "__main__":
    main()