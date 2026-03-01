import os
import re

patterns = {
    "N+1 Potential": re.compile(r"for .* \{.*Store\(\).*\.Get\(", re.DOTALL),
    "Hardcoded Secret": re.compile(r"(password|secret|key|token)\s*:=\s*\"[^\"]+\"", re.IGNORECASE),
    "Panic Usage": re.compile(r"panic\("),
    "Unchecked Error": re.compile(r",\s*_\s*:=\s*.*\(.*\)"),
    "SQL Injection Pattern": re.compile(r"\.Query\(.*fmt\.Sprintf", re.DOTALL),
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

root_dir = "server/channels"
log_entries = []

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(".go") and not file.endswith("_test.go"):
            path = os.path.join(root, file)
            findings = analyze_file(path)
            status = "Suspicious" if findings else "Clean"
            log_entries.append(f"| {path} | {status} | {', '.join(findings) if findings else 'None'} | {'Review needed' if findings else 'None'} | {'High' if 'SQL' in findings or 'Secret' in findings else 'Medium' if findings else 'Low'} |")

with open("AUDIT_LOG.md", "a") as f:
    f.write("\n".join(log_entries))
    f.write("\n")

print(f"Analyzed {len(log_entries)} files.")
