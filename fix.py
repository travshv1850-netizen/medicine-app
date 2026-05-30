with open('/Users/shu/Dev/projects/medicine-app/app/page.tsx', 'r') as f:
    content = f.read()

replacements = [
    ('"morning_before" as TimingKey, label: "寝る前"', '"morning_before" as TimingKey, label: "朝食前"'),
    ('"morning_after" as TimingKey, label: "寝る前"', '"morning_after" as TimingKey, label: "朝食後"'),
    ('"noon_before" as TimingKey, label: "寝る前"', '"noon_before" as TimingKey, label: "昼食前"'),
    ('"evening_before" as TimingKey, label: "寝る前"', '"evening_before" as TimingKey, label: "夕食前"'),
    ('"evening_after" as TimingKey, label: "寝る前"', '"evening_after" as TimingKey, label: "夕食後"'),
]

for old, new in replacements:
    content = content.replace(old, new)

with open('/Users/shu/Dev/projects/medicine-app/app/page.tsx', 'w') as f:
    f.write(content)

print("完了！")
