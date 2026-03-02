import os
import re

patterns = {
    "XSS Potential": re.compile(r"dangerouslySetInnerHTML"),
    "Hardcoded Secret": re.compile(r"(password|secret|key|token)\s*[:=]\s*['\"][^'\"]+['\"]", re.IGNORECASE),
    "TODO/FIXME": re.compile(r"TODO|FIXME"),
    "Large Component": re.compile(r"class.*extends.*React\.Component"), # Tracking legacy components
    "useEffect without deps": re.compile(r"useEffect\(\(\) => \{.*\}, \[\]\)", re.DOTALL), # Not necessarily a bug but often optimized
}

def analyze_file(filepath):
    results = []
    try:
        with open(filepath, 'r') as f:
            content = f.read()
            for name, pattern in patterns.items():
                if pattern.search(content):
                    results.append(name)
    except Exception as e:
        return f"Error reading {filepath}: {e}"

    return results

# Expanded scope
scan_dirs = ["webapp"]
log_entries = []

for sdir in scan_dirs:
    for root, dirs, files in os.walk(sdir):
        for file in files:
            if file.endswith((".ts", ".tsx")):
                path = os.path.join(root, file)
                findings = analyze_file(path)
                status = "Suspicious" if findings else "Clean"
                log_entries.append(f"| {path} | {status} | {', '.join(findings) if findings else 'None'} | {'Review needed' if findings else 'None'} | {'High' if 'XSS' in findings or 'Secret' in findings else 'Medium' if findings else 'Low'} |")

with open("AUDIT_LOG.md", "a") as f:
    f.write("\n## Expanded Webapp Audit\n")
    f.write("\n".join(log_entries))
    f.write("\n")

print(f"Analyzed {len(log_entries)} webapp files.")
