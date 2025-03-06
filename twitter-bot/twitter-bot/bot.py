import os
import time
import random
import tweepy
import openai
import schedule
import requests
import yfinance as yf
from dotenv import load_dotenv

# Load API keys from .env file
load_dotenv()

# Twitter API credentials
CONSUMER_KEY = os.getenv("TWITTER_CONSUMER_KEY")
CONSUMER_SECRET = os.getenv("TWITTER_CONSUMER_SECRET")
ACCESS_TOKEN = os.getenv("TWITTER_ACCESS_TOKEN")
ACCESS_SECRET = os.getenv("TWITTER_ACCESS_SECRET")

# FRED API key
FRED_API_KEY = os.getenv("FRED_API_KEY")

# OpenAI API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

# Authenticate Twitter API
auth = tweepy.OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
auth.set_access_token(ACCESS_TOKEN, ACCESS_SECRET)
api = tweepy.API(auth, wait_on_rate_limit=True)

print("🚀 Twitter bot is starting...")

# Get real-time sector data from Yahoo Finance
def get_sector_insight(ticker):
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period="1y")

        if hist.empty:
            return f"Could not retrieve data for {ticker}."

        current_price = hist['Close'].iloc[-1]
        year_ago_price = hist['Close'].iloc[0]
        percent_change = ((current_price - year_ago_price) / year_ago_price) * 100

        return f"{ticker} sector is at ${current_price:.2f}, {percent_change:+.2f}% over the past year."
    except Exception as e:
        return f"Error fetching data for {ticker}: {str(e)}"

# Get economic indicator (e.g., US Inflation Rate)
def get_fred_data(series_id):
    try:
        url = f"https://api.stlouisfed.org/fred/series/observations?series_id={series_id}&api_key={FRED_API_KEY}&file_type=json"
        response = requests.get(url).json()
        return response["observations"][-1]["value"]
    except Exception as e:
        return f"Error fetching FRED data: {str(e)}"

# Generate AI-powered tweet
def generate_ai_tweet(prompt):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "system", "content": "Generate a market update tweet."},
                      {"role": "user", "content": prompt}],
            max_tokens=280
        )
        return response["choices"][0]["message"]["content"]
    except Exception as e:
        return f"Error generating AI tweet: {str(e)}"

# Main function to generate a tweet
def generate_tweet():
    sectors = {"Tech": "XLK", "Energy": "XLE", "Finance": "XLF", "Healthcare": "XLV"}
    sector, ticker = random.choice(list(sectors.items()))
    insight = get_sector_insight(ticker)
    inflation = get_fred_data("CPIAUCSL")

    prompt = f"Summarize today's {sector} sector trends in one tweet. The sector is currently {insight}, and the latest US inflation rate is {inflation}%. Keep it engaging and professional."
    ai_tweet = generate_ai_tweet(prompt)

    return f"📊 {sector} Sector Update:\n{ai_tweet}\n\n#StockMarket #Investing #Finance"

# Post tweet
def post_tweet():
    print("📝 post_tweet() function has been called.")  # Debugging
    tweet = generate_tweet()
    print("📢 Generated Tweet:", tweet)  # Debugging

    try:
        api.update_status(tweet)
        print("✅ Tweet posted successfully!")
    except tweepy.TweepyException as e:
        print("❌ Error tweeting:", str(e))

# Auto-reply to trending tweets
def auto_reply():
    print("🔄 Checking for tweets to reply to...")  # Debugging
    search_terms = ["stock market", "investing", "S&P 500"]

    for term in search_terms:
        print(f"🔍 Searching Twitter for: {term}")  # Debugging
        for tweet in tweepy.Cursor(api.search_tweets, q=term, lang="en").items(3):
            try:
                response = "Interesting take! Have you looked at historical sector trends? Check out #HistoFin."
                print(f"💬 Replying to: {tweet.text}")  # Debugging
                api.update_status(status=response, in_reply_to_status_id=tweet.id, auto_populate_reply_metadata=True)
                print("✅ Replied successfully!")
            except tweepy.TweepyException as e:
                print("❌ Error replying:", e)

# Schedule daily tweets
schedule.every().day.at("12:00").do(post_tweet)
schedule.every(3).hours.do(auto_reply)

# Run bot continuously, but allow manual execution
if __name__ == "__main__":
    print("🚀 Twitter bot is starting...")
    schedule.run_pending()

    while True:
        print("⏳ Bot is running, checking schedule...")
        schedule.run_pending()
        time.sleep(60)

