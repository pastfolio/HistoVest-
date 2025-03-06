import tweepy
import os
import logging
import schedule
import time
import random
import requests
import openai
from dotenv import load_dotenv

# ✅ Load environment variables
load_dotenv()

# ✅ Force logging to console & file
logging.basicConfig(
    filename="twitter_bot.log",
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("twitter_bot.log"),
        logging.StreamHandler()  # ✅ Print logs to console
    ]
)

print("🚀 Twitter bot is starting...")
logging.info("🚀 Twitter bot is starting...")

# ✅ Load API Keys
consumer_key = os.getenv("TWITTER_CONSUMER_KEY")
consumer_secret = os.getenv("TWITTER_CONSUMER_SECRET")
access_token = os.getenv("TWITTER_ACCESS_TOKEN")
access_secret = os.getenv("TWITTER_ACCESS_SECRET")

# ✅ Print API keys to verify they are loaded (Remove in production)
print(f"🔹 TWITTER_CONSUMER_KEY: {consumer_key}")
print(f"🔹 TWITTER_CONSUMER_SECRET: {consumer_secret}")
print(f"🔹 TWITTER_ACCESS_TOKEN: {access_token}")
print(f"🔹 TWITTER_ACCESS_SECRET: {access_secret}")

logging.info("🔹 Loaded API keys successfully.")

# ✅ Authenticate with Tweepy
try:
    print("🔑 Attempting to authenticate with Twitter API...")
    auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_token, access_secret)
    api = tweepy.API(auth, wait_on_rate_limit=True)

    # ✅ Verify credentials
    user = api.verify_credentials()
    if user:
        print(f"✅ Twitter API Authentication Successful! Logged in as @{user.screen_name}")
        logging.info(f"✅ Authentication Successful: Logged in as @{user.screen_name}")
    else:
        print("❌ Authentication Failed! No user data received.")
        logging.error("❌ Authentication Failed! No user data received.")
except tweepy.TweepyException as e:
    print(f"❌ Twitter API Authentication Failed: {str(e)}")
    logging.error("❌ Authentication Error:", exc_info=True)

# ✅ Test API Call to Twitter
def test_twitter_api():
    BEARER_TOKEN = os.getenv("TWITTER_ACCESS_TOKEN")
    HEADERS = {
        "Authorization": f"Bearer {BEARER_TOKEN}",
        "User-Agent": "TwitterAPIRequest",
    }
    url = "https://api.twitter.com/2/tweets"
    response = requests.get(url, headers=HEADERS)

    print(f"🔹 Twitter API Response: {response.status_code} - {response.text}")
    logging.info(f"🔹 Twitter API Response: {response.status_code} - {response.text}")

test_twitter_api()

# ✅ Function to Post a Tweet
def post_tweet():
    print("📝 Generating a tweet...")
    logging.info("📝 Generating a tweet...")

    tweet_text = "🚀 This is a test tweet from the bot!"
    try:
        response = api.update_status(tweet_text)
        print(f"✅ Tweet posted successfully: {response.id}")
        logging.info(f"✅ Tweet posted successfully: {response.id}")
    except tweepy.TweepyException as e:
        print(f"❌ Error posting tweet: {str(e)}")
        logging.error("❌ Error posting tweet:", exc_info=True)

post_tweet()

# ✅ Keep Bot Running
while True:
    print("⏳ Bot is running, checking schedule...")
    logging.info("⏳ Bot is running, checking schedule...")
    schedule.run_pending()
    time.sleep(60)

