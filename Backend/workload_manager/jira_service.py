import requests
from requests.auth import HTTPBasicAuth

def get_jira_issues(email, api_token, domain):
    url = f"https://{domain}/rest/api/3/search"

    query = {
        "jql": "assignee = currentUser()",
        "maxResults": 50
    }

    headers = {
        "Accept": "application/json"
    }

    response = requests.get(
        url,
        headers=headers,
        params=query,
        auth=HTTPBasicAuth(email, api_token)
    )

    if response.status_code != 200:
        return []

    data = response.json()

    issues = []
    for issue in data["issues"]:
        fields = issue["fields"]

        issues.append({
            "title": fields["summary"],
            "status": fields["status"]["name"],
            "priority": fields.get("priority", {}).get("name", "Medium"),
            "deadline": fields.get("duedate"),
            "type": fields["issuetype"]["name"]
        })

    return issues
