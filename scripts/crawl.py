import re

import requests
import markdown_to_json
import json


def fetch_markdown_to_json(url: str):
    """从远程拉取 Markdown 并转换为 JSON"""
    response = requests.get(url)
    response.raise_for_status()
    md_text = response.text

    json_data = markdown_to_json.dictify(md_text)
    return json_data


def clean_data(data):
    parsed_data = json.loads(json.dumps(data, ensure_ascii=False))
    recipes = []

    pattern = re.compile(r'\[([^]]+)]\(([^)]+)\)')

    for item, content in parsed_data.items():
        if '菜谱' not in content:
            continue

        for tag, texts in content['菜谱'].items():
            if tag == '按难度索引':
                continue

            for text in texts:
                match = pattern.search(text)
                if match:
                    title, path = match.groups()
                    recipes.append({
                        "name": title,
                        "category": tag,
                        "link": path.replace('.md',''),
                        "source_path": path,
                    })

    return recipes

def save_data(data):
    with open('public/recipes.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def main():
    url = "https://raw.githubusercontent.com/Anduin2017/HowToCook/refs/heads/master/README.md"
    data = fetch_markdown_to_json(url)
    cleaned_data = clean_data(data)
    save_data(cleaned_data)


if __name__ == "__main__":
    main()
