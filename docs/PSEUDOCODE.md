# Part 2 — Pseudocode

## Data Model

```
TABLE parts:
  id          INTEGER PRIMARY KEY
  name        TEXT NOT NULL
  category    TEXT NOT NULL  (frame | gearSet | tyres | brakes | handlebars | seat | chain | wheels)
  price       REAL NOT NULL  (current price in INR)
  created_at  TIMESTAMP
  updated_at  TIMESTAMP

TABLE configurations:
  id          INTEGER PRIMARY KEY
  name        TEXT NOT NULL
  created_at  TIMESTAMP
  updated_at  TIMESTAMP

TABLE configuration_parts:
  id                INTEGER PRIMARY KEY
  configuration_id  INTEGER FK -> configurations.id
  part_id           INTEGER FK -> parts.id
  UNIQUE(configuration_id, part_id.category)  -- one part per category per config

TABLE price_history:
  id          INTEGER PRIMARY KEY
  part_id     INTEGER FK -> parts.id
  old_price   REAL
  new_price   REAL
  changed_at  TIMESTAMP
```

## Core Algorithm: Price Calculation

```
FUNCTION calculateConfigurationPrice(configurationId):
    // Fetch all parts linked to this configuration
    parts = SELECT p.name, p.category, p.price
            FROM configuration_parts cp
            JOIN parts p ON cp.part_id = p.id
            WHERE cp.configuration_id = configurationId

    IF parts IS EMPTY:
        RETURN error("Configuration has no parts")

    breakdown = []
    totalPrice = 0

    FOR EACH part IN parts:
        breakdown.APPEND({
            category: part.category,
            partName: part.name,
            price: part.price
        })
        totalPrice = totalPrice + part.price

    RETURN {
        configurationId: configurationId,
        breakdown: breakdown,
        totalPrice: totalPrice
    }
```

## API Workflow: Creating a Configuration

```
FUNCTION createConfiguration(requestBody):
    // Validate input
    name = requestBody.name
    partIds = requestBody.partIds  // array of part IDs

    IF name IS EMPTY:
        RETURN error(400, "Name is required")

    IF partIds.length != 8:
        RETURN error(400, "Must select exactly 8 parts (one per category)")

    // Verify one part per category
    categories = []
    FOR EACH partId IN partIds:
        part = SELECT * FROM parts WHERE id = partId
        IF part IS NULL:
            RETURN error(404, "Part not found: " + partId)
        IF part.category IN categories:
            RETURN error(400, "Duplicate category: " + part.category)
        categories.APPEND(part.category)

    // Verify all categories are covered
    requiredCategories = [frame, gearSet, tyres, brakes, handlebars, seat, chain, wheels]
    FOR EACH required IN requiredCategories:
        IF required NOT IN categories:
            RETURN error(400, "Missing category: " + required)

    // Create configuration
    BEGIN TRANSACTION
        config = INSERT INTO configurations (name) VALUES (name)
        FOR EACH partId IN partIds:
            INSERT INTO configuration_parts (configuration_id, part_id)
            VALUES (config.id, partId)
    COMMIT TRANSACTION

    RETURN config with price breakdown
```

## API Workflow: Updating a Part Price

```
FUNCTION updatePartPrice(partId, newPrice):
    part = SELECT * FROM parts WHERE id = partId

    IF part IS NULL:
        RETURN error(404, "Part not found")

    IF newPrice <= 0:
        RETURN error(400, "Price must be positive")

    oldPrice = part.price

    BEGIN TRANSACTION
        // Record price change in history
        INSERT INTO price_history (part_id, old_price, new_price, changed_at)
        VALUES (partId, oldPrice, newPrice, NOW())

        // Update the part's current price
        UPDATE parts SET price = newPrice, updated_at = NOW()
        WHERE id = partId
    COMMIT TRANSACTION

    RETURN updated part
```

## Frontend Workflow: Configuration Builder

```
FUNCTION ConfigurationBuilder():
    // State
    selectedParts = {}  // category -> partId
    allParts = FETCH /api/parts grouped by category

    FUNCTION handlePartSelect(category, partId):
        selectedParts[category] = partId
        recalculateTotal()

    FUNCTION recalculateTotal():
        total = 0
        FOR EACH category IN selectedParts:
            part = findPart(selectedParts[category])
            total = total + part.price
        DISPLAY total

    FUNCTION handleSave():
        IF not allCategoriesSelected():
            SHOW error("Please select a part from each category")
            RETURN

        POST /api/configurations {
            name: configName,
            partIds: Object.values(selectedParts)
        }
        NAVIGATE to configuration detail page

    RENDER:
        FOR EACH category IN categories:
            SHOW dropdown/card for category
            SHOW parts in that category with prices
            HIGHLIGHT selected part

        SHOW running total at bottom
        SHOW save button (disabled until all categories filled)
```
