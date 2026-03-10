from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import imaplib
import email
from email.header import decode_header
import os
import re
from datetime import datetime
import threading
import time

# Supabase - optional import
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    Client = None

# Create FastAPI app
app = FastAPI(title="Spam Detection API")

# Global flag for background task
background_task_running = False
background_thread = None

def background_email_fetcher():
    """Background task that fetches emails every 60 seconds"""
    global background_task_running
    background_task_running = True
    
    print("Background email fetcher started - will fetch every 60 seconds")
    
    while background_task_running:
        try:
            print(f" [{datetime.now().strftime('%H:%M:%S')}] Fetching emails from Gmail...")
            result, error = check_mail()
            
            if error:
                print(f"Error fetching emails: {error}")
            else:
                total = len(result.get("important", [])) + len(result.get("faculty", [])) + len(result.get("events", [])) + len(result.get("spam", [])) + len(result.get("regular", []))
                print(f"Fetched and stored {total} emails from Gmail")
                
        except Exception as e:
            print(f"Background task error: {e}")
        
        # Wait 60 seconds before next fetch
        time.sleep(60)

def start_background_task():
    """Start the background email fetcher thread"""
    global background_thread
    if background_thread is None or not background_thread.is_alive():
        background_thread = threading.Thread(target=background_email_fetcher, daemon=True)
        background_thread.start()
        print("Background task thread started")

def stop_background_task():
    """Stop the background email fetcher"""
    global background_task_running
    background_task_running = False
    print("Background task stopped")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    start_background_task()
    yield
    # Shutdown
    stop_background_task()

app = FastAPI(title="Spam Detection API", lifespan=lifespan)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# CONFIGURATION
# ============================================
IMAP_SERVER = "imap.gmail.com"
EMAIL_USER = "23053578@kiit.ac.in"
EMAIL_PASS = "fmva vcmw irid cpqf"   # Gmail App Password
TRASH_FOLDER = "[Gmail]/Trash"

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://xhleythklhhfecjwcdcm.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhobGV5dGhrbGhoZmVjandjZGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MjkzOTgsImV4cCI6MjA4NDMwNTM5OH0.k0by-tLtnbetUZqtNDQAkxUqHcFQUWunc9yvRtIhywQ")

supabase = None
if SUPABASE_AVAILABLE and SUPABASE_URL and SUPABASE_KEY and SUPABASE_URL != "https://your-project.supabase.co":
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Supabase initialized successfully!")
    except Exception as e:
        print(f"Warning: Could not initialize Supabase: {e}")

# University Heads - Always Important, Never Spam
UNIVERSITY_HEADS = [
    "director.csit@kiit.ac.in",
    "dean@kiit.ac.in",
    "assistantcontrollerofexaminations@kiit.ac.in",
    "registrar@kiit.ac.in",
    "vicechancellor@kiit.ac.in",
    "provicechancellor@kiit.ac.in",
    "iro@kiit.ac.in"
]

# Faculty Teachers
FACULTY_TEACHERS = [
    "Chitralekha Jena",
    "Dr Soumya Ranjan Mishra",
    "Manoj Kumar Mishra",
    "Santosh Swain",
    "Kajal Kishori",
    "Subhadip Pramanik",
    "Tulasi malini Maharatha",
    "Samita Pani",
    "Jayanta Mondal",
    "Lalit Vashishtha",
    "Ipsita Mohanty",
    "Nazia Tazin Imran",
    "Biswabandita Kar",
    "Madhusudan Bera"
]

# Event Keywords
EVENT_KEYWORDS = [
    "event",
    "workshop",
    "seminar",
    "webinar",
    "conference",
    "meeting",
    "schedule",
    "announcement",
    "invitation",
    "fest",
    "competition",
    "celebration"
]

# Strong signals: almost always spam/phishing (high weight)
SPAM_STRONG = [
    "lottery", "prize winner", "you have won", "claim your prize",
    "claim now", "act now", "urgent action required", "wire transfer",
    "bank details", "verify your account", "password reset", "suspended account",
    "free gift", "limited time offer", "exclusive offer", "congratulations you",
    "click here to claim", "claim free", "unclaimed prize", "nigerian prince",
    "dear winner", "lottery winner", "inheritance", "million dollars",
    "no catch", "risk free", "money back guarantee", "100% free",
]

# Weak signals: common in both spam and legitimate mail (low weight)
SPAM_WEAK = [
    "scholarship", "free certificate", "click here", "limited time",
    "congratulations", "attendance shortage", "exam fee refund",
    "exclusive", "offer", "deal", "discount", "winner"
]

# Trusted domains: require higher score to mark as spam (institutional senders)
TRUSTED_DOMAINS = (".ac.in", ".edu", ".gov", "kiit.ac.in", "kiit.edu")

# ============================================
# HELPER FUNCTIONS
# ============================================
def decode_text(text):
    if not text:
        return ""
    decoded, encoding = decode_header(text)[0]
    if isinstance(decoded, bytes):
        return decoded.decode(encoding or "utf-8", errors="ignore")
    return decoded

def extract_body(msg):
    body = ""
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() in ["text/plain", "text/html"]:
                try:
                    body = part.get_payload(decode=True).decode(errors="ignore")
                    break
                except:
                    pass
    else:
        try:
            body = msg.get_payload(decode=True).decode(errors="ignore")
        except:
            body = ""
    return body

def extract_email_address(sender_string):
    match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', sender_string)
    return match.group(0) if match else ""

def extract_name_from_sender(sender_string):
    if '<' in sender_string:
        return sender_string.split('<')[0].strip().strip('"').strip("'")
    return ""

def is_university_head(sender_email):
    sender_lower = sender_email.lower()
    return any(head.lower() in sender_lower for head in UNIVERSITY_HEADS)

def is_faculty_teacher(sender_name, sender_email):
    sender_lower = (sender_name + " " + sender_email).lower()
    return any(teacher.lower() in sender_lower for teacher in FACULTY_TEACHERS)

def is_event_email(subject, body):
    combined = (subject + " " + body).lower()
    return any(keyword in combined for keyword in EVENT_KEYWORDS)

def is_trusted_domain(sender_email):
    """Institutional/trusted senders get benefit of the doubt."""
    if not sender_email:
        return False
    domain = sender_email.lower().split("@")[-1] if "@" in sender_email else ""
    return any(domain.endswith(d) or d in domain for d in TRUSTED_DOMAINS)

def spam_score(sender_email, subject, body):
    """
    Returns a spam score (higher = more likely spam).
    Uses weighted signals so we only mark as spam when multiple indicators align.
    """
    if is_university_head(sender_email):
        return 0
    text = (subject + " " + body).lower()
    score = 0

    # Strong phrases: +2 each (clear spam/phishing)
    for phrase in SPAM_STRONG:
        if phrase in text:
            score += 2

    # Weak phrases: +1 each (could be legitimate)
    for phrase in SPAM_WEAK:
        if phrase in text:
            score += 1

    # Extra signals
    link_count = len(re.findall(r"https?://[^\s<>\"']+", body or "", re.I))
    if link_count > 5:
        score += 1
    if link_count > 10:
        score += 1

    caps_ratio = sum(1 for c in (subject or "") if c.isupper()) / max(len(subject or ""), 1)
    if caps_ratio > 0.6 and len(subject or "") > 10:
        score += 1

    # Trusted domain: require much higher score (institutional mail rarely spam)
    if is_trusted_domain(sender_email):
        if score <= 2:
            return 0
        score = max(0, score - 2)

    return score

# Spam threshold: score >= 3 required to mark as spam (weighted scoring reduces false positives)
SPAM_THRESHOLD = 3

def is_spam(sender_email, subject_or_combined, body=None):
    """
    Mark as spam only if score meets threshold (reduces false positives).
    Can be called as is_spam(email, combined_text) or is_spam(email, subject, body).
    """
    if body is not None:
        subject = subject_or_combined
        score = spam_score(sender_email, subject, body)
    else:
        combined = subject_or_combined
        score = spam_score(sender_email, combined[:500], combined)
    return score >= SPAM_THRESHOLD

def store_email(email_data, category):
    if supabase is None:
        return False
    try:
        supabase.table("emails").insert({
            "from_email": email_data.get("from_email", ""),
            "from_name": email_data.get("from_name", ""),
            "subject": email_data.get("subject", ""),
            "body": email_data.get("body", ""),
            "category": category,
            "received_at": datetime.now().isoformat()
        }).execute()
        return True
    except Exception as e:
        print(f"Error storing email ({category}): {e}")
        return False

def check_mail():
    important_emails = []
    faculty_emails = []
    event_emails = []
    spam_emails = []
    regular_emails = []

    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER)
        mail.login(EMAIL_USER, EMAIL_PASS)
        mail.select("INBOX")

        # Fetch latest 250 emails - optimized to fetch all at once
        status, messages = mail.search(None, "ALL")
        all_ids = messages[0].split()
        email_ids = all_ids[-250:] if len(all_ids) > 250 else all_ids  # last 250 emails or all if less than 250

        print(f"Processing {len(email_ids)} emails from Gmail...")

        for idx, e_id in enumerate(reversed(email_ids)):  # latest first
            try:
                status, data = mail.fetch(e_id, "(RFC822)")
                for response_part in data:
                    if isinstance(response_part, tuple):
                        msg = email.message_from_bytes(response_part[1])

                        sender = decode_text(msg.get("From"))
                        subject = decode_text(msg.get("Subject"))
                        body = extract_body(msg)

                        sender_email = extract_email_address(sender)
                        sender_name = extract_name_from_sender(sender)
                        combined_text = subject + " " + body

                        email_data_full = {
                            "from_email": sender_email,
                            "from_name": sender_name,
                            "subject": subject,
                            "body": body
                        }

                        email_data = {
                            "from": sender,
                            "from_email": sender_email,
                            "from_name": sender_name,
                            "subject": subject,
                            "body": body
                        }

                        categorized = False
                        category = "regular"

                        # 1) Heads => IMPORTANT
                        if is_university_head(sender_email):
                            important_emails.append(email_data)
                            category = "important"
                            store_email(email_data_full, category)
                            categorized = True

                        # 2) Faculty
                        elif is_faculty_teacher(sender_name, sender_email):
                            faculty_emails.append(email_data)
                            category = "faculty"
                            store_email(email_data_full, category)
                            categorized = True

                        # 3) Event
                        elif is_event_email(subject, body):
                            event_emails.append(email_data)
                            category = "events"
                            store_email(email_data_full, category)
                            categorized = True

                        # 4) Spam (use subject + body for precise scoring)
                        elif is_spam(sender_email, subject, body):
                            spam_emails.append(email_data)
                            category = "spam"
                            store_email(email_data_full, category)

                            # Move to trash
                            try:
                                mail.copy(e_id, TRASH_FOLDER)
                                mail.store(e_id, "+FLAGS", "\\Deleted")
                            except:
                                pass  # If moving to trash fails, still keep the email categorized
                            categorized = True

                        # 5) Regular
                        if not categorized:
                            regular_emails.append(email_data)
                            store_email(email_data_full, category)
            except Exception as email_error:
                print(f"Error processing email {e_id}: {email_error}")
                continue  # Skip this email and continue with the next one

        mail.expunge()
        mail.logout()
        
        print(f"Processed emails - Important: {len(important_emails)}, Faculty: {len(faculty_emails)}, Events: {len(event_emails)}, Spam: {len(spam_emails)}, Regular: {len(regular_emails)}")

        return {
            "important": important_emails,
            "faculty": faculty_emails,
            "events": event_emails,
            "spam": spam_emails,
            "regular": regular_emails
        }, None

    except Exception as e:
        return None, str(e)

def get_stored_emails_by_category():
    if supabase is None:
        return {"important": [], "faculty": [], "events": [], "spam": [], "regular": []}

    try:
        response = supabase.table("emails").select("*").order("received_at", desc=True).limit(500).execute()
        stored = response.data if hasattr(response, "data") else []

        categorized = {
            "important": [],
            "faculty": [],
            "events": [],
            "spam": [],
            "regular": []
        }

        for e in stored:
            category = e.get("category", "regular")
            email_formatted = {
                "from": (e.get("from_name", "") + " <" + e.get("from_email", "") + ">") if e.get("from_name") else e.get("from_email", ""),
                "from_email": e.get("from_email", ""),
                "from_name": e.get("from_name", ""),
                "subject": e.get("subject", ""),
                "body": e.get("body", "")
            }
            if category in categorized:
                categorized[category].append(email_formatted)

        return categorized

    except Exception as e:
        print(f"Error fetching stored emails: {e}")
        return {"important": [], "faculty": [], "events": [], "spam": [], "regular": []}

# ============================================
# API ROUTES
# ============================================
@app.get("/")
def root():
    return {"status": "Spam Detection API is running"}

@app.get("/api/check-emails")
def check_emails():
    """
    Return STORED & CLASSIFIED emails from Supabase
    No live classification - emails are pre-classified and stored
    """
    stored_emails = get_stored_emails_by_category()
    
    return {
        "success": True,
        "important": stored_emails.get("important", []),
        "faculty": stored_emails.get("faculty", []),
        "events": stored_emails.get("events", []),
        "spam": stored_emails.get("spam", []),
        "regular": stored_emails.get("regular", []),
        "source": "stored",
        "spamKeywords": SPAM_STRONG + SPAM_WEAK,
        "stats": {
            "important": len(stored_emails.get("important", [])),
            "faculty": len(stored_emails.get("faculty", [])),
            "events": len(stored_emails.get("events", [])),
            "spam": len(stored_emails.get("spam", [])),
            "regular": len(stored_emails.get("regular", []))
        }
    }

@app.get("/api/stored-emails")
def get_stored_emails(category: str = Query(None)):
    """Get stored emails from Supabase"""
    if supabase is None:
        return {
            "success": False,
            "error": "Supabase not configured",
            "emails": []
        }

    try:
        query = supabase.table("emails").select("*").order("received_at", desc=True).limit(500)
        if category:
            query = query.eq("category", category)

        response = query.execute()
        return {
            "success": True,
            "emails": response.data if hasattr(response, "data") else []
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "emails": []
        }

@app.get("/api/spam-emails")
def get_stored_spam():
    """Get stored spam emails from Supabase"""
    if supabase is None:
        return {
            "success": False,
            "error": "Supabase not configured",
            "emails": []
        }

    try:
        response = supabase.table("emails").select("*").eq("category", "spam").order("received_at", desc=True).limit(250).execute()
        return {
            "success": True,
            "emails": response.data if hasattr(response, "data") else []
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "emails": []
        }

@app.get("/api/spam-keywords")
def get_spam_keywords():
    return {
        "keywords": SPAM_STRONG + SPAM_WEAK,
        "strong": SPAM_STRONG,
        "weak": SPAM_WEAK,
        "threshold": SPAM_THRESHOLD,
        "trusted_domains": list(TRUSTED_DOMAINS)
    }

@app.get("/api/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)
