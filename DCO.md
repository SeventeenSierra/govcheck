# Developer Certificate of Origin

Version 1.1

```
Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.

Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.


Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```

## How to Sign Off

Add a `Signed-off-by` line to your commit messages:

```
feat: add new authentication module

Signed-off-by: Your Name <your-email@yourdomain.com>
```

You can do this automatically with:

```bash
git commit -s -m "your commit message"
```

Or configure Git to always sign off:

```bash
git config --global format.signoff true
```

## U.S. Federal Government Employees

If you are a U.S. Federal Government employee contributing within the scope of your employment, your work is in the public domain under 17 U.S.C. § 105. Add this to your commits:

```
feat: add compliance report feature

US-Government-Work: true
Signed-off-by: Jane Doe <jane.doe@gsa.gov>
```
