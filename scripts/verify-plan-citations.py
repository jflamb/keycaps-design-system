import re, subprocess, os, sys
doc = open("docs/adoption/migration-plan.md").read()
base = os.path.expanduser("~/Repos/jflamb/mcp-dnsimple")
problems = []
def lines_of(path, ref):
    if ref:
        return subprocess.check_output(["git","-C",base,"show",f"{ref}:{path}"],text=True).split("\n")
    full = os.path.join(base, path)
    return open(full).read().split("\n") if os.path.exists(full) else None

for m in re.finditer(r"`(?:mcp-dnsimple/)?([\w./_-]+\.(?:ts|tsx|mjs|json|yml|html)):(\d+)(?:-(\d+))?`", doc):
    path, a, b = m.group(1), int(m.group(2)), int(m.group(3) or m.group(2))
    ctx = doc[max(0,m.start()-240):m.end()+80]
    ref = "0f84dc6" if ("0f84dc6" in ctx and path.endswith("branding.ts")) else None
    L = lines_of(path, ref)
    if L is None: continue
    if b > len(L):
        problems.append(f"OUT OF BOUNDS {path}:{a}-{b} (file has {len(L)})"); continue
    first, last = L[a-1].strip(), L[b-1].strip()
    # A cited test range must start at the test and end at its closing brace.
    if re.match(r"tests/.*\.(ts|tsx)$", path) and a != b:
        if not re.match(r"(it|test)\(", first) and "for (const" not in first:
            problems.append(f"START NOT A TEST {path}:{a} -> {first[:60]}")
        if last not in ("});", "}"):
            problems.append(f"END NOT A CLOSE  {path}:{b} -> {last[:60]}")
    print(f"{path}:{a}-{b}\n    first: {first[:76]}\n    last:  {last[:76]}")
print("\n--- PROBLEMS ---")
print("\n".join(problems) if problems else "none")
sys.exit(1 if problems else 0)
