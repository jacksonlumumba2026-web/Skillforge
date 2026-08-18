"use client";

import { useEffect } from "react";

/** Ports the vanilla-JS interactivity from the original marketing site: sticky header, mobile nav, scroll reveals, animated stat counters, and hero parallax. */
export default function LandingInteractions() {
  useEffect(() => {
    const header = document.getElementById("siteHeader");
    const onScroll = () => header?.classList.toggle("scrolled", window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });

    const navToggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");
    const onToggle = () => {
      navLinks?.classList.toggle("open");
      navToggle?.classList.toggle("active");
    };
    navToggle?.addEventListener("click", onToggle);
    const navLinkEls = navLinks ? Array.from(navLinks.querySelectorAll("a")) : [];
    const closeNav = () => navLinks?.classList.remove("open");
    navLinkEls.forEach((a) => a.addEventListener("click", closeNav));

    const revealEls = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const groups = new Map<Element | null, HTMLElement[]>();
    revealEls.forEach((el) => {
      const parent = el.closest("section");
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent)!.push(el);
    });
    groups.forEach((list) => {
      list.forEach((el, i) => {
        el.style.transitionDelay = `${i * 90}ms`;
      });
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    revealEls.forEach((el) => io.observe(el));

    const stats = Array.from(document.querySelectorAll<HTMLElement>(".m-stat .n"));
    const statIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const raw = el.textContent?.trim() ?? "";
          const match = raw.match(/([\d.]+)/);
          if (match) {
            const target = parseFloat(match[1]);
            const suffix = raw.replace(match[1], "");
            const isDecimal = match[1].includes(".");
            let cur = 0;
            const steps = 40;
            const inc = target / steps;
            let n = 0;
            const timer = setInterval(() => {
              n++;
              cur += inc;
              if (n >= steps) {
                cur = target;
                clearInterval(timer);
              }
              el.textContent = (isDecimal ? cur.toFixed(1) : Math.round(cur)) + suffix;
            }, 30);
          }
          statIO.unobserve(el);
        });
      },
      { threshold: 0.4 },
    );
    stats.forEach((s) => statIO.observe(s));

    const streak = document.querySelector<HTMLElement>(".m-float-card.streak");
    const rate = document.querySelector<HTMLElement>(".m-float-card.rate");
    const onMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 960) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 14;
      const y = (e.clientY / window.innerHeight - 0.5) * 14;
      if (streak) streak.style.transform = `translate(${x}px, ${y}px)`;
      if (rate) rate.style.transform = `translate(${-x}px, ${-y}px)`;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      navToggle?.removeEventListener("click", onToggle);
      navLinkEls.forEach((a) => a.removeEventListener("click", closeNav));
      io.disconnect();
      statIO.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return null;
}
