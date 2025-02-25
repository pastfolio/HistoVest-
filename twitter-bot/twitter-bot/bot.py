import tweepy
import yfinance as yf
import requests
import openai
import schedule
import time
import random
import os
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
api = tweepy.API(auth)

# Get real-time sector data from Yahoo Finance
def get_sector_insight(ticker):
    stock = yf.Ticker(ticker)
    hist = stock.history(period="1y")

    if hist.empty:
        return f"Could not retrieve data for {ticker}."

    current_price = hist['Close'].iloc[-1]
    year_ago_price = hist['Close'].iloc[0]
    percent_change = ((current_price - year_ago_price) / year_ago_price) * 100

    return f"{ticker} sector is at ${current_price:.2f}, {percent_change:+.2f}% over the past year."

# Get economic indicator (e.g., US Inflation Rate)
def get_fred_data(series_id):
    url = f"https://api.stlouisfed.org/fred/series/observations?series_id={series_id}&api_key={FRED_API_KEY}&file_type=json"
    response = requests.get(url).json()

    if "observations" in response:
        latest_data = response["observations"][-1]["value"]
        return float(latest_data)
    return None

# Generate AI-powered tweet
def generate_ai_tweet(prompt):
    """Creates a tweet using OpenAI"""
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        return response["choices"][0]["message"]["content"]
    except Exception as e:
        return f"Error generating AI tweet: {str(e)}"

# Main function to generate a tweet
def generate_tweet():
    """Creates a market update tweet using AI"""
    sectors = {"Tech": "XLK", "Energy": "XLE", "Finance": "XLF", "Healthcare": "XLV"}
    sector, ticker = random.choice(list(sectors.items()))
    insight = get_sector_insight(ticker)

    inflation = get_fred_data("CPIAUCSL")
    prompt = f"Summarize today's {sector} sector trends in one tweet. The sector is currently {insight}, and the latest US inflation rate is {inflation}%. Keep it engaging and professional."
    
    ai_tweet = generate_ai_tweet(prompt)
    
    return f"📊 {sector} Sector Update:\n{ai_tweet}\n\n#StockMarket #Investing #Finance"

# Post tweet
def post_tweet():
    tweet = generate_tweet()
    try:
        api.update_status(tweet)
        print("Tweeted:", tweet)
    except tweepy.TweepyException as e:
        print("Error tweeting:", str(e))

# Auto-reply to trending tweets
def auto_reply():
    search_terms = ["stock market", "investing", "S&P 500"]
    for term in search_terms:
        for tweet in tweepy.Cursor(api.search_tweets, q=term, lang="en").items(5):
            try:
                response = "Interesting take! Have you looked at historical sector trends? Check out #HistoFin."
                api.update_status(status=response, in_reply_to_status_id=tweet.id)
                print("Replied to:", tweet.text)
            except tweepy.TweepyException as e:
                print("Error:", e)

# Schedule daily tweets
schedule.every().day.at("12:00").do(post_tweet)
schedule.every().hour.do(auto_reply)

# Run bot continuously
while True:
    schedule.run_pending()
    time.sleep(60)

