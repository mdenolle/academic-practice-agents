# Sample Solution Key — Two-Layer Refraction Survey (10 pts)

> **Note:** This is a fictional, original problem created as a format reference.
> It does not reproduce any question from any actual course.
> Do not submit this as a real solution key without replacing all values.

---

## Problem Statement

A seismometer records a refraction survey over a two-layer earth model. The near-surface layer has P-wave velocity v₁ = 2.4 km/s and thickness h = 3 km. The underlying half-space has P-wave velocity v₂ = 5.6 km/s.

- **Q1 (3 pts):** Derive the travel time T(x) for the direct wave and the head wave (refracted arrival). At what crossover distance x_cross do the two arrivals reach the receiver simultaneously?
- **Q2 (4 pts):** Calculate the critical angle i_c and the apparent velocity of the head wave as observed at the surface. What does the apparent velocity tell a field geologist about the subsurface?
- **Q3 (3 pts):** If v₂ is unknown, explain how a field seismologist would determine it from a T–x plot of refraction arrivals. What is the slope of the head wave branch, and what information does the intercept time carry?

---

## Q1 — Travel Times and Crossover Distance (3 pts)

### Full Worked Solution

**Direct wave travel time:**

The direct wave travels horizontally at velocity v₁:

```
T_direct(x) = x / v₁ = x / 2.4
```

**Head wave (refracted) travel time:**

The head wave travels down at the critical angle, along the interface at v₂, then back up. The standard formula for a single horizontal layer:

```
T_head(x) = x / v₂ + 2h·cos(i_c) / v₁
```

where i_c = arcsin(v₁/v₂) is the critical angle (derived in Q2).

Using i_c = arcsin(2.4/5.6) = arcsin(0.4286) = 25.38°:

```
cos(i_c) = sqrt(1 − (v₁/v₂)²) = sqrt(1 − 0.1837) = sqrt(0.8163) = 0.9035

T_head(x) = x / 5.6 + 2 × 3 × 0.9035 / 2.4
           = x / 5.6 + 6 × 0.9035 / 2.4
           = x / 5.6 + 5.421 / 2.4
           = x / 5.6 + 2.259 s
```

[Accept intercept time t_i = 2h·cos(i_c)/v₁ in range 2.22–2.30 s, i.e. ±2%]

**Crossover distance:**

Set T_direct = T_head:

```
x / v₁ = x / v₂ + 2h·cos(i_c) / v₁

x · (1/v₁ − 1/v₂) = 2h·cos(i_c) / v₁

x_cross = 2h·cos(i_c) / v₁ · [1/(1/v₁ − 1/v₂)]
         = 2h·cos(i_c) · v₁·v₂ / [v₁·(v₂ − v₁)]

Substituting:
x_cross = 2 × 3 × 0.9035 × 2.4 × 5.6 / [2.4 × (5.6 − 2.4)]
         = 2 × 3 × 0.9035 × 13.44 / [2.4 × 3.2]
         = 72.87 / 7.68
         ≈ 9.49 km
```

[Accept x_cross in range 9.30–9.68 km, i.e. ±2%]

Alternatively: x_cross = h · sqrt[(v₂+v₁)/(v₂−v₁)] · 2 (equivalent formula, full credit).

### Per-Step Point Breakdown

| Points | Criterion |
|--------|-----------|
| 1 pt | Correct T_direct(x) = x/v₁ |
| 1 pt | Correct T_head(x) formula with correct intercept term 2h·cos(i_c)/v₁ |
| 1 pt | Correct crossover distance x_cross ≈ 9.5 km (±2%) with working shown |

### Common Student Errors

- **Missing factor of 2 in intercept term** (wrote h·cos(i_c)/v₁ instead of 2h·): −0.5 pt on T_head, may still get x_cross credit if method is correct
- **Used i_c before deriving it** (forward reference without justification): accept if Q2 is answered, deduct 0 pts if formula is stated correctly
- **Arithmetic error in x_cross** with correct setup: −0.5 pt
- **No working shown, correct answer only**: derivation cap applies, max 1.5/3

### Derivation Cap

Applies. Correct T_direct and T_head formulas with no derivation → max 1.5/3. Correct x_cross with no crossover calculation shown → deduct 0.5 pt.

---

## Q2 — Critical Angle and Apparent Velocity (4 pts)

### Full Worked Solution

**Critical angle:**

At the critical angle, the refracted ray travels along the interface (refraction angle = 90°). From Snell's law:

```
sin(i_c) / v₁ = sin(90°) / v₂ = 1/v₂

i_c = arcsin(v₁/v₂) = arcsin(2.4/5.6) = arcsin(0.4286)
i_c ≈ 25.38°
```

[Accept 25.0°–25.8°, i.e. ±2% of the sin value]

**Apparent velocity of the head wave:**

The head wave arrives at the surface with apparent velocity equal to v₂, because it travels horizontally along the surface at the rate set by the refractor:

```
V_apparent = v₂ = 5.6 km/s
```

This can be seen directly from T_head(x) = x/v₂ + t_i: the slope of the T–x line is 1/v₂, so the apparent velocity (inverse slope) is v₂.

**Geological interpretation:**

The apparent velocity V_apparent = v₂ = 5.6 km/s gives the P-wave velocity of the deeper layer. This is a direct measurement of the second-layer velocity without needing to drill. A field geologist uses this to identify the rock type: 5.6 km/s is consistent with crystalline basement (granite or gneiss) or dense carbonate rock. Velocities in this range rule out unconsolidated sediments or saturated clays.

### Per-Step Point Breakdown

| Points | Criterion |
|--------|-----------|
| 1 pt | Correct application of Snell's law at critical angle (sin(i_c) = v₁/v₂) |
| 1 pt | Correct numerical value i_c ≈ 25.4° (±2%) |
| 1 pt | Correct apparent velocity = v₂ = 5.6 km/s, with correct derivation from slope of T_head |
| 1 pt | Correct geological interpretation: apparent velocity measures the refractor velocity, identifies rock type or layer properties |

### Common Student Errors

- **Used sin(i_c) = v₂/v₁ instead of v₁/v₂**: fundamental sign/ratio error, −1 pt; subsequent calculations may still receive partial credit if method is otherwise correct
- **Stated apparent velocity without justification**: −0.5 pt
- **Geological interpretation too vague** ("tells us something about the subsurface"): −0.5 to −1 pt depending on depth of explanation
- **Confused apparent velocity with phase velocity**: −1 pt, note in feedback

### Derivation Cap

Applies to the critical angle derivation. Correct i_c without Snell's law setup → max 0.5/1 for that step. Geological interpretation is opinion-based; derivation cap does not apply to the interpretation sentence.

---

## Q3 — Determining v₂ from a T–x Plot (3 pts)

### Full Worked Solution

**Setup:**

When v₂ is unknown, the refraction method uses the geometry of the T–x plot to recover both v₂ and h.

**Slope of the head wave branch:**

The head wave travel time is:

```
T_head(x) = x/v₂ + t_i
```

This is a straight line in T–x space. The slope is:

```
slope = dT/dx = 1/v₂
```

Therefore:

```
v₂ = 1/slope
```

A field seismologist measures the slope of the head wave branch on the T–x plot and takes its reciprocal to recover v₂. Graphically: choose two points (x₁, T₁) and (x₂, T₂) on the head wave line and compute:

```
v₂ = (x₂ − x₁) / (T₂ − T₁)
```

**Intercept time:**

The intercept time t_i is the y-intercept of the head wave line (the value of T_head at x = 0, obtained by extrapolation):

```
t_i = 2h·cos(i_c) / v₁
```

Once v₂ is known (from the slope), and therefore i_c = arcsin(v₁/v₂) is known, the layer thickness h can be recovered:

```
h = t_i · v₁ / (2·cos(i_c))
```

The intercept time thus carries information about **layer thickness**, not velocity. It is the key observable for recovering h after v₂ has been determined from the slope.

**Accepted alternative approaches:**

- Graphical derivation: drawing the T–x line by hand and reading off slope and intercept — full credit if procedure is correctly described
- Using x_cross to solve for h once v₂ is known from the slope — full credit
- Delay time method — full credit if correctly described

### Per-Step Point Breakdown

| Points | Criterion |
|--------|-----------|
| 1 pt | Correct identification that the slope of the head wave branch = 1/v₂, so v₂ = 1/slope |
| 1 pt | Correct procedure: measure slope from two points on the refractor branch, take reciprocal |
| 1 pt | Correct interpretation of intercept time: t_i = 2h·cos(i_c)/v₁, carries information about layer thickness h |

### Common Student Errors

- **Confused slope of direct wave (1/v₁) with slope of head wave (1/v₂)**: −1 pt
- **Stated that intercept time gives velocity**: −1 pt; common confusion
- **Described the method qualitatively without the slope formula**: −0.5 pt
- **Forgot that i_c must be known before h can be recovered from t_i**: minor omission, −0 to −0.5 pt depending on context

### Derivation Cap

Applies to the slope derivation. "The slope gives v₂" without derivation from T_head formula → max 0.5/1 for that step. The interpretation of t_i as thickness indicator is conceptual; derivation cap does not apply strictly, but the formula t_i = 2h·cos(i_c)/v₁ should be present for full credit.
