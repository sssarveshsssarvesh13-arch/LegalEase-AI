def sanitize_text(text:str)->str:
    replacements={
        "\u2018":"'",
        "\u2019":"'",
        "\u201c":'"',
        "\u201d":'"',
        "\u2013":"-",
        "\u2014":"-"
    }

    for old,new in replacements.items():
        text=text.replace(old,new)

    return text.strip()