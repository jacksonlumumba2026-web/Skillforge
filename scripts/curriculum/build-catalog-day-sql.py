#!/usr/bin/env python3
"""One-off: turn a day-N catalogue plan (JSON) into the migration SQL.

Same escaping rules as scripts/curriculum/build-level-sql.mjs -- doubled
single quotes for SQL literals, JSON for knowledge_check. Written because
hand-typing 12 rich lessons of SQL string literals is how quoting bugs
happen.
"""
import json, sys

def s(v):
    return "'" + str(v).replace("'", "''") + "'"

def arr(items):
    return "array[" + ", ".join(s(i) for i in items) + "]"

def quiz(q):
    return "'" + json.dumps(q, ensure_ascii=False).replace("'", "''") + "'::jsonb"

plan = json.load(open(sys.argv[1]))
out = [plan["header"], ""]

for c in plan["courses"]:
    out.append(
        "insert into public.courses (slug, title, description, level, price, published, display_order, category) values\n"
        f"  ({s(c['slug'])}, {s(c['title'])}, {s(c['description'])}, {s(c['level'])}, {c['price']}, true, {c['displayOrder']}, {s(c['category'])})\n"
        "on conflict (slug) do nothing;\n"
    )

out.append("do $$")
out.append("declare")
out.append("  v_course_id uuid;")
out.append("  v_l1 uuid; v_l2 uuid; v_l3 uuid;")
out.append("  v_m1 uuid; v_m2 uuid; v_m3 uuid;")
out.append("begin")

for c in plan["courses"]:
    out.append(f"\n  -- ---- {c['title']} ----")
    out.append(f"  select id into v_course_id from public.courses where slug = {s(c['slug'])};")
    out.append("")
    for i, lv in enumerate(c["levels"], start=1):
        out.append(
            "  insert into public.levels (course_id, title, description, order_number) values\n"
            f"    (v_course_id, {s(lv['title'])}, {s(lv['description'])}, {i}) returning id into v_l{i};"
        )
    out.append("")
    for i, m in enumerate(c["modules"], start=1):
        out.append(
            "  insert into public.modules (course_id, level_id, title, description, order_number) values\n"
            f"    (v_course_id, v_l{i}, {s(m['title'])}, {s(m['description'])}, {i}) returning id into v_m{i};"
        )
    out.append("")
    for i, m in enumerate(c["modules"], start=1):
        rows = []
        for j, ls in enumerate(m["lessons"], start=1):
            rows.append(
                f"    (v_m{i}, {s(ls['title'])}, {s(ls['description'])}, "
                f"{s('https://www.youtube.com/watch?v=' + ls['youtubeId'])}, {j},\n"
                f"      {arr(ls['objectives'])},\n"
                f"      {s(ls['notes'])},\n"
                f"      {s(ls['practice'])},\n"
                f"      {quiz(ls['quiz'])})"
            )
        out.append(
            "  insert into public.lessons (module_id, title, description, youtube_url, order_number,"
            " learning_objectives, notes, practice_activity, knowledge_check) values\n"
            + ",\n".join(rows) + "\n  on conflict (module_id, order_number) do nothing;"
        )

out.append("\nend $$;")
open(sys.argv[2], "w").write("\n".join(out) + "\n")
print("wrote", sys.argv[2])
