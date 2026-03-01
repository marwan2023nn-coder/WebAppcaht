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

root_dir = "webapp/channels/src"
log_entries = []

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith((".ts", ".tsx")):
            path = os.path.join(root, file)
            findings = analyze_file(path)
            status = "Suspicious" if findings else "Clean"
            log_entries.append(f"| {path} | {status} | {', '.join(findings) if findings else 'None'} | {'Review needed' if findings else 'None'} | {'High' if 'XSS' in findings or 'Secret' in findings else 'Medium' if findings else 'Low'} |")

with open("AUDIT_LOG.md", "a") as f:
    f.write("\n## Webapp Sweep\n")
    f.write("| File Path | Status | Findings | Recommendations | Criticality |\n|-----------|--------|----------|-----------------|-------------|\n")
    f.write("\n".join(log_entries))
    f.write("\n")

print(f"Analyzed {len(log_entries)} files.")
