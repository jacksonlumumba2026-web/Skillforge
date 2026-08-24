-- Rebuilds Cybersecurity & Online Safety onto the new Course -> Level ->
-- Module -> Lesson model (see 0033_learning_path_levels.sql). This is the
-- first course actually migrated onto it — Level 1 "Foundations" is fully
-- built with real, individually-verified videos and full lesson content
-- (objectives/notes/practice/knowledge-check); Levels 2-5 are scaffolded
-- (title + description only, matching the planned curriculum) so the
-- Learning Path shows its full intended shape without pretending content
-- exists that hasn't been researched yet.
--
-- The old 6-module/12-lesson structure is replaced outright, not layered
-- on top — it doesn't map onto the new structure. One real learner had 11
-- lessons marked complete on the old structure; deleting these modules
-- cascades to their lessons and then to that learner's lesson_progress
-- rows, resetting their progress on this course. (Confirmed this was the
-- site owner's own test enrollment, not a paying customer, before doing
-- this — see conversation.)

delete from public.modules where course_id = 'bb0d0b5f-ebb4-4888-af6d-35c5915bf453';

do $$
declare
  v_course_id uuid := 'bb0d0b5f-ebb4-4888-af6d-35c5915bf453';
  v_level1 uuid; v_level2 uuid; v_level3 uuid; v_level4 uuid; v_level5 uuid;
  v_m1 uuid; v_m2 uuid; v_m3 uuid; v_m4 uuid;
begin
  -- ---------------------------------------------------------------------
  -- Levels
  -- ---------------------------------------------------------------------
  insert into public.levels (course_id, title, description, order_number) values
    (v_course_id, 'Foundations', 'Computer, networking, and Linux basics — the groundwork everything else in this Learning Path builds on.', 1) returning id into v_level1;
  insert into public.levels (course_id, title, description, order_number) values
    (v_course_id, 'Core Security', 'Security principles, common threats and attacks, authentication and access control, and cryptography basics. Coming soon.', 2) returning id into v_level2;
  insert into public.levels (course_id, title, description, order_number) values
    (v_course_id, 'Practical Security', 'Network security, web security, hands-on security tools, and vulnerability assessment. Coming soon.', 3) returning id into v_level3;
  insert into public.levels (course_id, title, description, order_number) values
    (v_course_id, 'Defensive Security', 'Security monitoring, incident response, SOC fundamentals, and threat detection. Coming soon.', 4) returning id into v_level4;
  insert into public.levels (course_id, title, description, order_number) values
    (v_course_id, 'Projects', 'Applied security projects, culminating in a final cybersecurity project that ties the whole Learning Path together. Coming soon.', 5) returning id into v_level5;

  -- ---------------------------------------------------------------------
  -- Level 1 modules
  -- ---------------------------------------------------------------------
  insert into public.modules (course_id, level_id, title, description, order_number) values
    (v_course_id, v_level1, 'Introduction to Cybersecurity', 'What cybersecurity is, why it matters, who the attackers are, and how the field works as a career.', 1) returning id into v_m1;
  insert into public.modules (course_id, level_id, title, description, order_number) values
    (v_course_id, v_level1, 'Computer Fundamentals', 'How computers, operating systems, and file systems work — the basics that make the security material make sense.', 2) returning id into v_m2;
  insert into public.modules (course_id, level_id, title, description, order_number) values
    (v_course_id, v_level1, 'Networking Fundamentals', 'IP addresses, DNS, DHCP, TCP/UDP, ports, firewalls, and basic network troubleshooting.', 3) returning id into v_m3;
  insert into public.modules (course_id, level_id, title, description, order_number) values
    (v_course_id, v_level1, 'Linux Fundamentals', 'Command-line navigation, the Linux file system, permissions, package management, and basic shell scripting.', 4) returning id into v_m4;

  -- ---------------------------------------------------------------------
  -- Module 1: Introduction to Cybersecurity
  -- ---------------------------------------------------------------------
  insert into public.lessons (module_id, title, description, youtube_url, order_number, learning_objectives, notes, practice_activity, knowledge_check) values
    (v_m1, 'What Is Cybersecurity and Why It Matters', 'A quick, plain-language introduction to what cybersecurity is and why every internet user needs to care about it.', 'https://www.youtube.com/watch?v=inWWhr5tnEA', 1,
      array['Define cybersecurity in plain terms', 'Explain why individuals and organizations need it', 'Identify what''s at stake when security fails (data, money, trust)'],
      'Cybersecurity is the practice of protecting computers, networks, and data from unauthorized access, damage, or theft. It matters because almost everything we value — money, identity, business records, personal photos — now lives digitally, and anyone connected to the internet is a potential target. Good cybersecurity isn''t about being paranoid; it''s about building habits that make you a harder, less attractive target than the next person.',
      'List the 5 accounts you would be most upset to lose access to (email, bank, social media, etc.) and write one sentence on what a criminal could do with each one.',
      '[{"question":"What is the primary goal of cybersecurity?","options":["Making computers faster","Protecting systems, networks, and data from harm","Building websites","Writing software"],"correct_index":1},{"question":"Why does cybersecurity matter to individuals, not just companies?","options":["It doesn''t — only companies need it","Personal data, money, and identity are also targets","Only governments are targeted","It''s required by law for everyone"],"correct_index":1}]'::jsonb),
    (v_m1, 'The CIA Triad: Confidentiality, Integrity, Availability', 'An overview of the CIA Triad — the three core principles that every security decision is built around.', 'https://www.youtube.com/watch?v=mQK9YBPUp08', 2,
      array['Define confidentiality, integrity, and availability', 'Give a real-world example of each being violated', 'Explain why all three must be balanced together'],
      'The CIA Triad is the foundation of cybersecurity thinking. Confidentiality means only authorized people can see information (like a password keeping your email private). Integrity means information stays accurate and unaltered (like ensuring your bank balance isn''t secretly changed). Availability means systems and data are accessible when needed (like a hospital''s patient records being reachable during an emergency). Every security control — passwords, backups, firewalls — exists to protect one or more of these three things.',
      'Pick one app or service you use daily and write one example of how it protects confidentiality, one for integrity, and one for availability.',
      '[{"question":"Which part of the CIA Triad is violated if a hacker changes the amount in your bank transaction?","options":["Confidentiality","Integrity","Availability","Authentication"],"correct_index":1},{"question":"A website going down during a big sale due to an attack is a violation of:","options":["Confidentiality","Integrity","Availability","None of the above"],"correct_index":2}]'::jsonb),
    (v_m1, 'Who Are the Attackers? Types and Motivations', 'A breakdown of the different types of hackers and the ethical lines that separate them.', 'https://www.youtube.com/watch?v=9K8Xn0y5CU4', 3,
      array['Distinguish black hat, white hat, and grey hat hackers', 'Identify common attacker motivations (money, ideology, curiosity, espionage)', 'Explain why "hacker" doesn''t automatically mean "criminal"'],
      'Not all hackers are criminals. White hat hackers work legally and with permission to find and fix security weaknesses. Black hat hackers break in illegally for personal gain, sabotage, or ideology. Grey hat hackers sit in between — they might break rules without permission but without malicious intent, often reporting flaws afterward. Attacker motivations vary widely: financial gain, political or social causes (hacktivism), national interests (state-sponsored espionage), or simple curiosity and reputation-building.',
      'Search a recent news story about a hack and identify which attacker type (black/white/grey hat) and which motivation (money, ideology, curiosity, espionage) best fits it.',
      '[{"question":"A hacker hired by a company to legally test their systems for weaknesses is a:","options":["Black hat","White hat","Script kiddie","Grey hat"],"correct_index":1},{"question":"Which of these is NOT a common attacker motivation?","options":["Financial gain","Political ideology","Improving customer service","Curiosity/reputation"],"correct_index":2}]'::jsonb),
    (v_m1, 'Real-World Impact: Anatomy of a Data Breach', 'A closer look at the 2017 Equifax breach — one of history''s largest — and what it reveals about the real cost of poor security.', 'https://www.youtube.com/watch?v=mPjgRKW_Jmk', 4,
      array['Describe how a major real-world breach unfolded', 'Identify the consequences of a breach for a company and its customers', 'Explain why breaches often stay undetected for a long time'],
      'The Equifax breach exposed the personal data of about 147 million people because a known software vulnerability wasn''t patched in time. It illustrates a common pattern in breaches: a small, fixable oversight leads to massive consequences — lawsuits, fines, loss of customer trust, and years of cleanup. Breaches often go undetected for weeks or months because attackers try to stay hidden, which is why monitoring and quick patching matter so much.',
      'Search "have i been pwned" and check (using an email you''re comfortable using) whether any of your accounts appear in a known breach.',
      '[{"question":"The Equifax breach was made possible largely because of:","options":["A phishing email","An unpatched known software vulnerability","A stolen laptop","A weak Wi-Fi password"],"correct_index":1},{"question":"What is a common consequence of a major data breach for a company?","options":["Increased customer trust","Fines, lawsuits, and reputational damage","Automatic government bailout","No real consequences"],"correct_index":1}]'::jsonb),
    (v_m1, 'Cybersecurity Terminology You Need to Know', 'A beginner-friendly glossary walkthrough of the cybersecurity terms you''ll see everywhere in this course and beyond.', 'https://www.youtube.com/watch?v=M-VOwTUqIoI', 5,
      array['Define key terms: malware, phishing, firewall, encryption, vulnerability', 'Use correct terminology to describe a basic security scenario', 'Recognize jargon commonly used in security news and job listings'],
      'Cybersecurity has its own vocabulary, and knowing it makes everything else easier to follow. Malware is malicious software designed to harm or exploit a system. Phishing is tricking someone into giving up information, usually via fake emails or messages. A firewall filters network traffic to block unwanted access. Encryption scrambles data so only authorized parties can read it. A vulnerability is a weakness that could be exploited by an attacker.',
      'Write your own one-sentence definition (in your own words, no copying) for malware, phishing, firewall, encryption, and vulnerability.',
      '[{"question":"Tricking someone into revealing their password through a fake email is called:","options":["Encryption","Phishing","Firewalling","Patching"],"correct_index":1},{"question":"A weakness in a system that an attacker could exploit is called a:","options":["Firewall","Vulnerability","Backup","Protocol"],"correct_index":1}]'::jsonb),
    (v_m1, 'Cybersecurity as a Career', 'A practical roadmap covering how people actually break into cybersecurity careers, from an experienced industry educator.', 'https://www.youtube.com/watch?v=xa1xegWf0HY', 6,
      array['Identify 2-3 common entry-level cybersecurity roles', 'Describe general skills/paths people use to break into the field', 'Explain why cybersecurity is a growing career field'],
      'Cybersecurity is one of the fastest-growing career fields because every organization with digital systems needs people to protect them. Entry points include roles like SOC (Security Operations Center) analyst, IT support with a security focus, and GRC (governance, risk, compliance) assistant. Most people build a path through some mix of self-study, certifications (like CompTIA Security+), hands-on practice (labs, home projects), and networking.',
      'Search "entry-level cybersecurity jobs" on a job site in your country and write down 3 job titles along with one required skill each.',
      '[{"question":"Which is a commonly cited entry point into cybersecurity?","options":["CEO","SOC Analyst","Company founder","Investor"],"correct_index":1},{"question":"Which of these is typically part of building a cybersecurity career path?","options":["Avoiding all certifications","Hands-on practice and certifications","Never using a computer","Only working in sales"],"correct_index":1}]'::jsonb)
  on conflict (module_id, order_number) do nothing;

  -- ---------------------------------------------------------------------
  -- Module 2: Computer Fundamentals
  -- ---------------------------------------------------------------------
  insert into public.lessons (module_id, title, description, youtube_url, order_number, learning_objectives, notes, practice_activity, knowledge_check) values
    (v_m2, 'How a Computer Works: The Basics', 'A foundational look at what a computer actually is and how it processes information.', 'https://www.youtube.com/watch?v=Cu3R5it4cQs', 1,
      array['Explain what a computer does at a basic level (input → process → output)', 'Identify the core components involved in that process', 'Explain why understanding this helps you understand security later'],
      'At its core, a computer is a machine that takes in input (like a keystroke or a click), processes it using its hardware and software, and produces output (like text on a screen). This input-process-output cycle happens constantly and is the basis for everything a computer does. Understanding this basic flow matters for security because most attacks are really just someone trying to sneak unauthorized input into that process, or steal the output.',
      'Open any app on your phone or computer and identify one input, the processing that likely happens, and the output you see — write it down as a 3-step chain.',
      '[{"question":"What are the three basic stages a computer uses to work with information?","options":["Save, delete, repeat","Input, process, output","Boot, sleep, shutdown","Type, click, print"],"correct_index":1},{"question":"Why does understanding basic computer function matter for cybersecurity?","options":["It doesn''t relate at all","Most attacks interfere with normal input/output flow","Only programmers need this knowledge","Computers don''t process input"],"correct_index":1}]'::jsonb),
    (v_m2, 'Hardware vs Software', 'A simple breakdown of the difference between the physical parts of a computer and the programs that run on them.', 'https://www.youtube.com/watch?v=1d-1Ei4D7mo', 2,
      array['Distinguish hardware from software with examples', 'Explain how hardware and software depend on each other', 'Identify at least 3 examples of each on a personal device'],
      'Hardware is the physical, touchable part of a computer — the screen, keyboard, hard drive, processor. Software is the set of instructions (programs, apps, operating systems) that tell the hardware what to do. Neither works without the other. This distinction matters in security because hardware and software each have different types of vulnerabilities and different ways of being protected.',
      'Walk around your home or workspace and list 5 pieces of hardware you own, then list 5 pieces of software installed on any one of your devices.',
      '[{"question":"Which of these is an example of hardware?","options":["A web browser","A keyboard","An operating system","An antivirus app"],"correct_index":1},{"question":"What best describes the relationship between hardware and software?","options":["They are unrelated","Software gives instructions that hardware carries out","Hardware is a type of software","Software is a physical component"],"correct_index":1}]'::jsonb),
    (v_m2, 'Operating Systems Overview', 'An overview of what an operating system is and how it manages everything happening on a computer.', 'https://www.youtube.com/watch?v=OZfF-zY2QG0', 3,
      array['Explain what an operating system does', 'Name at least 3 common operating systems', 'Identify the OS running on their own device'],
      'An operating system (OS) is the software that manages all of a computer''s hardware and other software — it''s the "manager" that lets your apps use the screen, keyboard, storage, and internet connection without conflicting with each other. Common examples include Windows and macOS for desktops/laptops, and Android and iOS for mobile devices, plus Linux which is widely used on servers. Every app you open is actually asking the OS for permission to use hardware resources.',
      'Check what operating system (and version) is running on your own phone and computer, and write down where you found that information in the settings.',
      '[{"question":"What is the main job of an operating system?","options":["To connect to Wi-Fi only","To manage hardware and software so programs can run","To design websites","To write emails"],"correct_index":1},{"question":"Which of these is an operating system?","options":["Google Chrome","Microsoft Word","Android","YouTube"],"correct_index":2}]'::jsonb),
    (v_m2, 'Navigating Files and Folders', 'A practical walkthrough of how files and folders work and how to move around a computer''s file system.', 'https://www.youtube.com/watch?v=wFv_mIozZYs', 4,
      array['Explain how files and folders organize data on a computer', 'Navigate a file system to locate a specific file', 'Identify common file types by their extensions'],
      'A file system is how a computer organizes and stores data — files are individual pieces of data (documents, photos, programs), and folders (directories) group related files together, similar to a filing cabinet. File extensions like .docx, .jpg, or .exe tell the computer (and you) what type of file it is. Knowing how to navigate a file system matters for security because malware often disguises itself using misleading file names or hidden folders.',
      'Open your computer''s file explorer (File Explorer on Windows or Finder on Mac) and find where downloaded files are stored, then identify the file extensions of 5 different files there.',
      '[{"question":"What is the purpose of a folder (directory) on a computer?","options":["To run programs","To group and organize related files","To connect to the internet","To delete files automatically"],"correct_index":1},{"question":"A file named \\"report.docx\\" — what does \\".docx\\" tell you?","options":["The file''s size","The file''s owner","The type of file/format","The file''s password"],"correct_index":2}]'::jsonb),
    (v_m2, 'File Permissions Basics', 'A quick, practical explanation of file permissions and why controlling who can read, write, or run a file is a core security concept.', 'https://www.youtube.com/watch?v=LnKoncbQBsM', 5,
      array['Explain what file permissions control', 'Describe the difference between read, write, and execute access', 'Explain why not everyone should have full access to every file'],
      'File permissions control who is allowed to view (read), change (write), or run (execute) a file or folder. Even on a personal computer, different user accounts can have different permission levels, which is why an "administrator" account can do things a "standard" account cannot. This is one of the most basic building blocks of cybersecurity: limiting access to only what someone actually needs (the "principle of least privilege") reduces the damage if an account is ever compromised.',
      'On your own computer, right-click a file or folder and open its "Properties" (Windows) or "Get Info" (Mac) to find the permissions/sharing settings, and note what you see.',
      '[{"question":"What do file permissions control?","options":["The file''s color","Who can read, write, or execute a file","The internet speed","The file''s file extension"],"correct_index":1},{"question":"Why is limiting access to only what''s needed (least privilege) good security practice?","options":["It makes files load faster","It reduces potential damage if an account is compromised","It''s required to open any file","It has no real benefit"],"correct_index":1}]'::jsonb),
    (v_m2, 'Troubleshooting Mindset', 'A beginner-friendly walkthrough of how to methodically diagnose and fix common computer problems — a mindset you''ll reuse constantly in cybersecurity.', 'https://www.youtube.com/watch?v=IKKAKzgGwFw', 6,
      array['Describe a basic step-by-step approach to troubleshooting a computer issue', 'Identify the value of checking simple causes first', 'Apply a troubleshooting mindset to a common tech problem'],
      'Troubleshooting is the process of methodically figuring out why something isn''t working, rather than guessing randomly. A good approach starts simple: check the obvious things first (is it plugged in, is it connected to Wi-Fi, has it been restarted), then narrow down the problem step by step, changing only one thing at a time so you know what actually fixed it. This same methodical, one-variable-at-a-time mindset is exactly what''s used later in this course to investigate security incidents.',
      'Think of (or intentionally cause, like turning off Wi-Fi) a small tech problem on your device and write down the troubleshooting steps you took, in order, until it was resolved.',
      '[{"question":"What is a recommended first step when troubleshooting a computer issue?","options":["Reinstall the entire OS immediately","Check simple, obvious causes first","Buy a new computer","Ignore the problem"],"correct_index":1},{"question":"Why should you change only one thing at a time while troubleshooting?","options":["It''s slower on purpose","So you know exactly what fixed the problem","It''s required by the manufacturer","It has no particular reason"],"correct_index":1}]'::jsonb)
  on conflict (module_id, order_number) do nothing;

  -- ---------------------------------------------------------------------
  -- Module 3: Networking Fundamentals
  -- ---------------------------------------------------------------------
  insert into public.lessons (module_id, title, description, youtube_url, order_number, learning_objectives, notes, practice_activity, knowledge_check) values
    (v_m3, 'What Computer Networking Is', 'A beginner-friendly look at what a computer network actually is and how devices talk to each other.', 'https://www.youtube.com/watch?v=IHdXfUHBBEI', 1,
      array['Explain what a computer network is and why devices connect', 'Identify common network types (LAN, WAN, the internet)', 'Describe the client-server relationship'],
      'A computer network is simply two or more devices connected so they can share data and resources — from two laptops sharing a printer up to the global internet. Most networks run on a client-server model: a client (your phone or laptop) requests something, and a server provides it. That basic exchange underlies everything else in networking and security.',
      'Run `ipconfig` (Windows) or `ifconfig`/`ip a` (Mac/Linux) to see how your own device identifies itself on its local network.',
      '[{"question":"What is a computer network?","options":["A single computer with multiple programs","Two or more devices connected to share data and resources","A type of antivirus software","A physical cable only"],"correct_index":1},{"question":"In the client-server model, what does the client do?","options":["Provides resources to other devices","Requests resources or services from a server","Stores all network passwords","Blocks unwanted traffic"],"correct_index":1}]'::jsonb),
    (v_m3, 'IP Addresses (IPv4 Basics)', 'A clear walkthrough of IPv4 addressing — how addresses are structured and assigned.', 'https://www.youtube.com/watch?v=JNNcyZ_VE2A', 2,
      array['Define what an IP address is and why devices need one', 'Describe the structure of an IPv4 address', 'Distinguish public vs private IP addresses'],
      'An IP address is a numerical label identifying a device on a network, like a postal address for data. IPv4 addresses are four numbers 0-255 separated by dots (e.g., 192.168.1.10). Private addresses work only inside a local network; public addresses identify a device on the internet at large.',
      'Run `ipconfig`/`ifconfig` and identify your private IP address and default gateway, then check a site like whatismyipaddress.com for your public IP.',
      '[{"question":"How many numbers make up an IPv4 address?","options":["Two","Three","Four","Six"],"correct_index":2},{"question":"Which is a private IP range used at home?","options":["8.8.8.8","192.168.x.x","1.1.1.1","172.217.x.x"],"correct_index":1}]'::jsonb),
    (v_m3, 'How DNS Works', 'An animated explainer showing how DNS translates the domain names we type into IP addresses.', 'https://www.youtube.com/watch?v=kURzoJ0Qj9o', 3,
      array['Explain the purpose of DNS', 'Describe the process of resolving a domain to an IP address', 'Identify the A record type'],
      'DNS is the internet''s phone book — it translates names like google.com into the IP addresses computers actually use. Your device asks a DNS server to "resolve" a name before connecting. Attackers sometimes tamper with DNS to redirect users to fake sites, which is why understanding it matters for security.',
      'Use mxtoolbox.com or `nslookup <domain>` to look up the A record (IP address) for a website of your choice.',
      '[{"question":"What is the main job of DNS?","options":["Encrypt traffic","Translate domain names into IP addresses","Assign IP addresses","Block malicious sites"],"correct_index":1},{"question":"An \\"A record\\" points to?","options":["An email server","A domain''s IPv4 address","A firewall rule","A password"],"correct_index":1}]'::jsonb),
    (v_m3, 'How DHCP Works', 'PowerCert''s animated breakdown of DHCP and how devices automatically get an IP address.', 'https://www.youtube.com/watch?v=rIsDEVMDaok', 4,
      array['Explain what DHCP does and why it''s needed', 'Differentiate static vs dynamic IP addressing', 'Identify where DHCP typically runs'],
      'DHCP automatically assigns IP addresses to devices joining a network so no one has to type one in manually. Without it, every device needs a static (manual) address — unmanageable past a handful of devices. Most home/office routers run DHCP, handing out an IP plus DNS and gateway info on connect.',
      'Check your router''s admin page (often 192.168.1.1) or your device''s network settings to find your DHCP-assigned IP and lease time.',
      '[{"question":"What does DHCP do?","options":["Encrypt traffic","Automatically assign IP addresses","Block unauthorized devices","Translate domain names"],"correct_index":1},{"question":"A static IP address is?","options":["One that changes every few minutes","One manually configured and fixed","Only used by servers","Assigned by DNS"],"correct_index":1}]'::jsonb),
    (v_m3, 'TCP vs UDP Basics', 'A side-by-side animated comparison of the two core transport protocols that move data across networks.', 'https://www.youtube.com/watch?v=uwoD5YsGACg', 5,
      array['Differentiate TCP and UDP at a basic level', 'Identify a use case suited to each', 'Explain the reliability-vs-speed tradeoff'],
      'TCP is connection-oriented and reliable — it confirms every piece of data arrives and resends anything lost, good for web pages and downloads. UDP skips those checks for speed, suiting real-time uses like video calls and gaming where a little lost data matters less than lag.',
      'Look at a Wireshark capture (install it or view a sample capture screenshot online) and identify a few packets labeled TCP vs UDP.',
      '[{"question":"Which guarantees data arrives in order?","options":["UDP","TCP","DNS","DHCP"],"correct_index":1},{"question":"A typical UDP use case?","options":["Loading a webpage","Sending an email","Live video streaming","Downloading a file"],"correct_index":2}]'::jsonb),
    (v_m3, 'Common Ports and Protocols', 'Professor Messer runs through the most important ports and protocols every network learner should know.', 'https://www.youtube.com/watch?v=jX1pobYmZdE', 6,
      array['Define what a network port is', 'Match common protocols to well-known port numbers', 'Explain why ports matter for security'],
      'A port is a numbered "door" on a device for a specific kind of traffic — an IP address is the building, ports are apartment numbers. HTTP uses port 80, HTTPS uses 443, SSH uses 22. Security pros track open ports closely because each is a potential entry point.',
      'Run an authorized scan of your own machine or a legal test target (e.g., `nmap scanme.nmap.org`) and record which ports appear open.',
      '[{"question":"HTTPS typically uses which port?","options":["21","80","443","22"],"correct_index":2},{"question":"A \\"port\\" in networking is?","options":["A physical cable","A numbered channel identifying a service on a device","A type of firewall","A backup IP address"],"correct_index":1}]'::jsonb),
    (v_m3, 'What a Firewall Does', 'Black Hills Information Security breaks down firewall basics — what they are, where they sit, and how their rules work.', 'https://www.youtube.com/watch?v=K4ilFsm2GvA', 7,
      array['Explain the purpose of a firewall', 'Describe how firewalls filter traffic using rules', 'Identify a real-world firewall example'],
      'A firewall is a checkpoint between a network (or device) and the outside world, deciding what traffic to allow or block using rules — e.g., blocking all inbound traffic except port 443 on a web server. Firewalls exist as dedicated hardware, built into routers, or as software (like Windows Firewall).',
      'Open your OS''s built-in firewall settings (Windows Defender Firewall / macOS Firewall) and identify one allowed and one blocked rule.',
      '[{"question":"A firewall primarily does what?","options":["Speeds up connections","Filters traffic based on rules","Translates domain names","Assigns IP addresses"],"correct_index":1},{"question":"An example of a firewall is?","options":["DNS server","Windows Defender Firewall","DHCP service","A web browser"],"correct_index":1}]'::jsonb),
    (v_m3, 'Basic Network Troubleshooting', 'A hands-on walkthrough of the essential Windows commands used to diagnose everyday network problems.', 'https://www.youtube.com/watch?v=Kb-C_HtPYHQ', 8,
      array['Use ping to test connectivity', 'Use tracert/traceroute to trace a network path', 'Interpret basic ipconfig/ifconfig output'],
      '`ping` checks whether a host is reachable and how long a round trip takes; `tracert`/`traceroute` shows every hop your traffic takes, helping spot where a connection fails; `ipconfig`/`ifconfig` shows your device''s own network configuration. These are core everyday tools in IT support and security work.',
      'Run `ping 8.8.8.8` then `tracert 8.8.8.8` (`traceroute` on Mac/Linux) and note what each output tells you.',
      '[{"question":"`ping` primarily tests?","options":["Whether a host is reachable and how fast it responds","Your IP address","DNS configuration","Open firewall ports"],"correct_index":0},{"question":"`tracert`/`traceroute` shows?","options":["Installed programs","The path (hops) traffic takes to a destination","Wi-Fi password","MAC address"],"correct_index":1}]'::jsonb)
  on conflict (module_id, order_number) do nothing;

  -- ---------------------------------------------------------------------
  -- Module 4: Linux Fundamentals
  -- ---------------------------------------------------------------------
  insert into public.lessons (module_id, title, description, youtube_url, order_number, learning_objectives, notes, practice_activity, knowledge_check) values
    (v_m4, 'What Linux Is and Why It Matters for Security', 'Google''s Cybersecurity Certificate series explains what Linux is and why it''s the operating system of choice in security work.', 'https://www.youtube.com/watch?v=-E97kKJTBxc', 1,
      array['Explain what Linux is and how it differs from Windows/macOS', 'Identify why Linux is widely used in security work', 'Recognize a common Linux distribution'],
      'Linux is a free, open-source OS powering everything from servers to Android phones to most security tools. Its source code is public, letting anyone inspect and audit it — a big reason it''s trusted for servers and security tooling. Distributions like Ubuntu, Debian, and Kali Linux package the same core system for different purposes.',
      'Look up three Linux distributions (e.g., Ubuntu, Debian, Kali Linux) and write one sentence on what each is commonly used for.',
      '[{"question":"What makes Linux different from Windows in terms of code?","options":["It''s open-source and publicly available","It only runs on phones","It needs no OS at all","It can''t run on servers"],"correct_index":0},{"question":"Which distro is built specifically for security/pentesting?","options":["Ubuntu","Kali Linux","Windows Server","macOS"],"correct_index":1}]'::jsonb),
    (v_m4, 'Navigating the Command Line / Basic Commands', 'Colt Steele''s freeCodeCamp course teaches the most-used Linux terminal commands, starting from the absolute basics.', 'https://www.youtube.com/watch?v=ZtqBQ68cfJc', 2,
      array['Use pwd, ls, and cd to navigate the file system', 'Explain absolute vs relative paths', 'Create and remove a directory from the command line'],
      'The command line is a text-based way to control Linux, and a handful of commands unlock most day-to-day work. `pwd` prints your location, `ls` lists what''s there, `cd` moves you between folders. Paths are absolute (from root `/`) or relative (from where you are) — knowing the difference avoids a lot of confusion.',
      'Run `pwd`, then `ls`, then `cd` into a folder, create one with `mkdir practice`, and remove it with `rmdir practice`.',
      '[{"question":"Which command shows your current directory?","options":["ls","pwd","cd","mkdir"],"correct_index":1},{"question":"A relative path starts from?","options":["The root directory /","Your current directory","Another user''s home directory","A remote server"],"correct_index":1}]'::jsonb),
    (v_m4, 'The Linux File System Layout', 'Fireship''s rapid-fire tour of Linux''s top-level directories and what each one is for.', 'https://www.youtube.com/watch?v=42iQKuQodW4', 3,
      array['Describe the purpose of the root directory (/)', 'Identify key top-level directories (e.g., /home, /etc, /var)', 'Explain what the Filesystem Hierarchy Standard is'],
      'Every file on Linux lives under one root directory, `/` — there''s no separate "C: drive." `/home` holds user files, `/etc` holds configuration, `/var` holds logs and changing data, `/bin` holds essential programs. This consistent layout is the Filesystem Hierarchy Standard (FHS), and learning it once means you can navigate almost any Linux system.',
      'Run `ls /` to see top-level directories, then `cd /etc` and `ls` to see what configuration files live there.',
      '[{"question":"The top-level directory in Linux is called?","options":["C:\\\\","root or /","/home","/system"],"correct_index":1},{"question":"Which directory typically holds system-wide configuration files?","options":["/var","/etc","/tmp","/bin"],"correct_index":1}]'::jsonb),
    (v_m4, 'File Permissions (chmod/chown Basics)', 'A step-by-step walkthrough of managing file and folder ownership and permissions with chmod and chown.', 'https://www.youtube.com/watch?v=EclBrxqQjWg', 4,
      array['Explain read, write, and execute permission types', 'Use chmod to change a file''s permissions', 'Use chown to change a file''s owner'],
      'Every Linux file has permissions for the owner, group, and everyone else, each with read (r), write (w), execute (x) rights. `chmod` changes what''s allowed (e.g., `chmod 755 file`); `chown` changes who owns the file. Overly open permissions (like `chmod 777`) are a common real-world security mistake.',
      'Run `touch test.txt`, then `ls -l test.txt` to see current permissions, then `chmod 644 test.txt` and `ls -l` again to see what changed.',
      '[{"question":"chmod does what?","options":["Changes a file''s owner","Changes a file''s permissions","Deletes a file","Moves a file"],"correct_index":1},{"question":"In Linux permissions, \\"x\\" represents?","options":["Read","Write","Execute","Delete"],"correct_index":2}]'::jsonb),
    (v_m4, 'Installing Software with a Package Manager', 'Linode''s "Top Docs" series with Jay LaCroix shows how the apt package manager finds, installs, and updates software on Debian-based Linux.', 'https://www.youtube.com/watch?v=j3fOfBwom5k', 5,
      array['Explain what a package manager does', 'Use a package manager to install/update software (e.g., apt)', 'Identify why package managers are safer than random installers'],
      'A package manager installs, updates, and removes software automatically, handling any other software ("dependencies") it needs. On Debian-based systems, that''s `apt`: `sudo apt update` refreshes the available package list, `sudo apt install <package>` installs by name. This is safer than downloading installers from random websites, since packages come from a maintained repository.',
      'On Linux (or WSL/a VM), run `sudo apt update` then `sudo apt install curl` (or check `curl --version` if already installed).',
      '[{"question":"Main job of a package manager?","options":["Scan for viruses","Install, update, and remove software automatically","Manage user permissions","Configure network settings"],"correct_index":1},{"question":"`sudo apt update` does what?","options":["Installs a new program","Refreshes the list of available packages from repositories","Deletes old software","Restarts the system"],"correct_index":1}]'::jsonb),
    (v_m4, 'A First Look at Basic Shell Scripting', 'freeCodeCamp''s beginner tutorial writes your first bash scripts, covering variables, loops, and basic logic.', 'https://www.youtube.com/watch?v=tK9Oc6AEnR4', 6,
      array['Explain what a shell script is and why it''s useful', 'Write a simple bash script that runs multiple commands', 'Use a variable inside a bash script'],
      'A shell script is a text file of commands you''d otherwise type one at a time — saving it lets you run the whole sequence at once. Scripts start with a shebang line (`#!/bin/bash`) telling the system which shell to use, and can store values in variables (like `name="Chuck"`) to reuse throughout.',
      'Create `hello.sh` with `#!/bin/bash` and `echo "Hello, $(whoami)!"`, make it executable with `chmod +x hello.sh`, and run it with `./hello.sh`.',
      '[{"question":"Purpose of #!/bin/bash at the top of a script?","options":["A comment with no effect","Tells the system which shell/interpreter to use","Deletes the file after running","Sets file permissions"],"correct_index":1},{"question":"What must you do before running ./script.sh?","options":["Rename it to .exe","Make it executable with chmod","Move it to /etc","Convert it to .bin"],"correct_index":1}]'::jsonb)
  on conflict (module_id, order_number) do nothing;
end $$;
