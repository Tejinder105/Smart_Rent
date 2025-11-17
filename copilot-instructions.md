# 🧠 GitHub Copilot — SmartRent UI/UX Rules
These rules tell Copilot how to generate consistent, modern, theme-based UI for the SmartRent React Native app.

Copilot must follow these guidelines when generating, editing, or refactoring UI code.

---

# 🎨 1. Theme System (Must Use)
Always use the SmartRent theme system:

- `theme.colors.*` for all colors  
- `theme.spacing.*` for spacing  
- `theme.borderRadius.*` for rounded corners  
- `theme.typography.*` for text  
- `theme.shadows.*` for shadows  
- `theme.layout.*` for component sizing

Never use hardcoded colors like `#fff`, `#000`, `gray`, etc.

Never use raw magic values like `margin: 10` or `padding: 7`.

Always replace them with theme tokens or Tailwind utilities.

---

# 💙 2. Brand Colors (Required)
Primary brand color:

```
#236B63
```

Use only via:

```
theme.colors.primary
bg-primary-500
text-primary-500
border-primary-500
```

Never write raw teal hex values manually.

---

# 🌗 3. Light + Dark Mode (Mandatory)
Copilot must always generate UI compatible with:

- `theme.colors.background`
- `theme.colors.surface`
- `theme.colors.text`
- `theme.colors.textSecondary`
- `theme.colors.card`
- `theme.colors.inputBg`
- `theme.colors.inputBorder`

Never use fixed white/black backgrounds.

---

# 📏 4. Spacing Rules
Use structured spacing:

```
theme.spacing.xs
theme.spacing.sm
theme.spacing.md
theme.spacing.lg
theme.spacing.xl
theme.spacing.2xl
theme.spacing.3xl
```

For Tailwind (NativeWind), use:

```
p-md
px-lg
pt-xl
gap-lg
mt-2xl
```

Spacing must always be consistent across screens.

---

# 🔲 5. Border Radius Rules
Use theme tokens:

```
rounded-md
rounded-lg
rounded-xl
```

Avoid sharp corners unless intentional.

---

# 🧱 6. Component Hierarchy Rules

## Cards
- `bg-surface-0` or `bg-surface-100`
- `p-lg` or `p-xl`
- `rounded-xl`
- Optional `shadow-md`

## Buttons
**Primary Button**
- `bg-primary-500`
- `text-white`
- `rounded-lg`
- `py-md px-xl`

**Secondary Button**
- `bg-surface-200`
- `text-text-primary`

**Ghost Button**
- `bg-transparent`
- `text-primary-500`

## Inputs
- `bg-inputBg`
- `border-inputBorder`
- `border-inputFocus`
- `rounded-lg`
- `px-lg py-md`

---

# 🧱 7. Layout Rules
- `flex-1 bg-background`
- `px-xl py-lg`
- Use card-style grouping
- `gap-lg` or `gap-xl` between elements

---

# ✍️ 8. Typography Rules
Use:

```
text-base
text-lg
text-xl
text-2xl
```

Use semantic colors:

```
text-text-primary
text-text-secondary
```

---

# ⚡ 9. Shadows / Elevation
Web:

```
shadow-sm shadow-md shadow-lg
```

React Native:

```
...theme.shadows.md
```

---

# 📐 10. Screen Layout Standards
- `flex-1 bg-background`
- Add consistent padding
- Use cards for grouped content
- Titles: `text-xl font-semibold`
- Spacing between sections: `mt-xl` or `mt-2xl`

---

# 🎯 11. Copilot Behavior Rules

Copilot must:

- Clean UI
- Use theme tokens
- Avoid duplication
- Improve spacing and hierarchy
- Ensure dark-mode compatibility

Copilot must NOT:

- Use hardcoded colors
- Add arbitrary spacing
- Break theme structure

---

# 🚀 12. Example Expected Output

```jsx
<View className="bg-surface-0 p-xl rounded-xl shadow-md">
  <Text className="text-text-primary text-lg font-semibold">
    SmartRent Overview
  </Text>

  <Text className="text-text-secondary mt-sm">
    Manage rent, utilities, and expenses with ease.
  </Text>

  <View className="flex-row gap-md mt-xl">
    <ButtonPrimary label="Add Expense" />
    <ButtonGhost label="View Logs" />
  </View>
</View>
```
