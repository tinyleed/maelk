# DNS setup for mælk.com on GitHub Pages

Display domain:

```text
mælk.com
```

Punycode / DNS-safe domain:

```text
xn--mlk-yla.com
```

## Namecheap records for GitHub Pages

In Namecheap → Domain List → `mælk.com` / `xn--mlk-yla.com` → Advanced DNS:

Remove conflicting parking/URL redirect records for `@` and `www`, then add:

```text
Type: A Record
Host: @
Value: 185.199.108.153
TTL: Automatic

Type: A Record
Host: @
Value: 185.199.109.153
TTL: Automatic

Type: A Record
Host: @
Value: 185.199.110.153
TTL: Automatic

Type: A Record
Host: @
Value: 185.199.111.153
TTL: Automatic

Type: CNAME Record
Host: www
Value: tinyleed.github.io
TTL: Automatic
```

Optional IPv6 records:

```text
Type: AAAA Record
Host: @
Value: 2606:50c0:8000::153
TTL: Automatic

Type: AAAA Record
Host: @
Value: 2606:50c0:8001::153
TTL: Automatic

Type: AAAA Record
Host: @
Value: 2606:50c0:8002::153
TTL: Automatic

Type: AAAA Record
Host: @
Value: 2606:50c0:8003::153
TTL: Automatic
```

After DNS propagates, set GitHub Pages custom domain to:

```text
xn--mlk-yla.com
```

Then verify:

```bash
curl -I https://xn--mlk-yla.com
curl -I https://www.xn--mlk-yla.com
```
