# MPDX Shared Resources Guide for AI Agents

This document provides a comprehensive reference of all shared functions, components, and utilities available in the MPDX React codebase. Use this guide to understand and leverage existing resources effectively.

## Table of Contents

- [Core Libraries (`src/lib`)](#core-libraries-srclib)
- [Utility Functions (`src/utils`)](#utility-functions-srcutils)  
- [Shared Components (`src/components/Shared`)](#shared-components-srccomponentsshared)
- [Quick Reference](#quick-reference)
- [Usage Guidelines](#usage-guidelines)

---

## Core Libraries (`src/lib`)

### 🌐 Internationalization & Formatting

#### `src/lib/intlFormat.ts`
**Purpose**: Comprehensive internationalization formatting for currency, dates, numbers, and percentages.

**Core Functions**:
- `currencyFormat(amount, currency, locale)` - Formats currency with proper symbols
- `amountFormat(amount, currency, locale)` - Alternative currency formatting  
- `parseNumberFromCurrencyString(currencyString, locale)` - Parses numbers from formatted currency
- `numberFormat(number, locale)` - Number formatting with locale separators
- `percentageFormat(percentage, locale)` - Percentage formatting

**Date Functions**:
- `dateFormat(date, locale)` - Full date formatting
- `dateFormatShort(date, locale)` - Short date format
- `dateFormatWithoutYear(date, locale)` - Date without year
- `dateFormatMonthOnly(date, locale)` - Month only
- `dayMonthFormat(date, locale)` - Day and month
- `monthYearFormat(date, locale)` - Month and year  
- `dateFromParts(year, month, day)` - Create date from parts
- `dateTimeFormat(dateTime, locale)` - Date and time formatting
- `validateAndFormatInvalidDate(date, locale)` - Handle invalid dates

#### `src/lib/i18n.ts`
**Purpose**: React-i18next internationalization configuration.
- Translation functions via `i18n.t()`
- Language detection and switching
- Namespace organization

### 🔄 Data Transformation

#### `src/lib/snakeToCamel.ts`
**Purpose**: Object key case conversion utilities.

**Functions**:
- `snakeToCamel(inputKey)` - Convert snake_case to camelCase
- `camelToSnake(inputKey)` - Convert camelCase to snake_case
- `camelToSnakeObject(object)` - Convert entire object keys to snake_case

#### `src/lib/removeObjectNulls.ts` 
**Purpose**: Clean objects by removing null/undefined values.
- `filterNullValues(obj)` - Default export, recursively removes nulls

#### `src/lib/deserializeJsonApi.ts`
**Purpose**: JSON API response deserialization.
- `fetchAllData(object, includedData)` - Main deserialization with relationships

#### `src/lib/createPatch.ts`
**Purpose**: JSON patch creation for object differences.
- Default export: `createPatch(target, source)` - Creates RFC 6902 patches

#### `src/lib/reduceObject.ts`
**Purpose**: Advanced object reduction utilities.
- Default export: curried reduce function for objects

### 📅 Date & Time Utilities

#### `src/lib/dateRangeHelpers.ts`
**Purpose**: Date range calculations using Luxon.
- `getTwelveMonthReportDateRange()` - Returns 12-month range string

### ⚠️ Error Handling

#### `src/lib/getErrorFromCatch.ts`
**Purpose**: Safe error message extraction.
- `getErrorMessage(err)` - Extracts string messages from various error types

### 📊 Analytics & Monitoring

#### `src/lib/analytics.ts`
**Purpose**: Analytics event dispatching.
- `dispatch(event, data?)` - Dispatches analytics events with optional data

#### `src/lib/dataDog.ts`
**Purpose**: DataDog RUM integration and monitoring.

**Configuration**:
- `isDataDogConfigured()` - Check if DataDog is properly configured
- `accountListIdsStorageKey` - Storage key constant

**User Management**:
- `setDataDogUser({userId, email, accountListIds})` - Set user context
- `clearDataDogUser()` - Remove user context

### 🌐 External Integrations

#### `src/lib/helpjuice.ts`
**Purpose**: Helpjuice help system integration.
- `articles` - Object mapping article identifiers
- `ArticleVar` - Type for article keys

#### `src/lib/extractCookie.ts`
**Purpose**: Browser cookie utilities.
- `extractCookie(cookies, cookieName)` - Extract specific cookie values

### 🎯 Form Helpers

#### `src/lib/formikHelpers.ts`
**Purpose**: Yup validation schemas for Formik forms.
- `dateTime()` - DateTime validation schema
- `nullableDateTime()` - Nullable DateTime schema  
- `requiredDateTime(message?)` - Required DateTime with custom message

### 🗄️ Static Data

#### `src/lib/data/countries.ts`
**Purpose**: Internationalized country data.
- `getCountries()` - Returns array of countries with names and ISO codes

#### `src/lib/data/languages.ts`
**Purpose**: Supported language configurations.
- `languages` - Array of supported languages with codes
- `formatLanguage(code, languagesList)` - Format language code to display name

### ⚡ Apollo GraphQL

#### `src/lib/apollo/cache.ts`
**Purpose**: Apollo Client cache configuration.
- `createCache()` - Creates configured InMemoryCache with type policies

#### `src/lib/apollo/client.ts`
**Purpose**: Main Apollo Client configuration.
- Default export: `makeClient()` - Creates configured Apollo Client

#### `src/lib/apollo/ssrClient.ts`
**Purpose**: Server-side rendering Apollo Client.
- Default export: `makeSsrClient()` - SSR-optimized client

#### `src/lib/apollo/link.ts`
**Purpose**: Apollo Link configuration for request handling.
- `isNativeOperation(operation)` - Determines API routing
- `makeAuthLink(apiToken)` - Creates authentication link
- `batchLink` - Configured batch link with routing

#### `src/lib/apollo/relayStylePaginationWithNodes.tsx`
**Purpose**: Custom pagination field policy.
- `relayStylePaginationWithNodes<TNode>()` - Relay-style pagination supporting nodes

#### `src/lib/apollo/accountListRedirect.ts`
**Purpose**: Account list error handling and redirects.
- `isAccountListNotFoundError(error)` - Detects account list errors
- `replaceUrlAccountList(url, defaultAccountList)` - URL account list replacement

---

## Utility Functions (`src/utils`)

### 🔍 URL & Query Handling

#### `src/utils/queryParam.ts`
**Purpose**: Safe Next.js router query parameter extraction.
- `getQueryParam(query, param)` - Safely extract query parameters as strings

### 📋 Data Source Management  

#### `src/utils/sourceHelper.ts`
**Purpose**: Data source information and editability management.

**Constants**:
- `manualSourceValue` - Constant for manual data source ('MPDX')
- `editableSources` - Array of editable source identifiers

**Functions**:
- `sourceToStr(t, source)` - Convert source codes to human-readable names
- `isEditableSource(source)` - Determine if data from source is editable
- `sourcesMatch(defaultSource, itemSource)` - Compare source values

### 🌍 Localization Functions

#### `src/utils/functions/convertContactStatus.ts`
**Purpose**: Contact status conversion utilities.
- `convertStatus(status)` - Convert status strings to enum values
- `findOldStatus(status)` - Handle legacy status format conversion

#### `src/utils/functions/getLocalizedExcludedFromAppealReasons.ts`
**Purpose**: Localized appeal exclusion reasons.
- `getLocalizedExcludedFromAppealReasons(t, excludedReason)` - Returns localized reason text

#### `src/utils/functions/getLocalizedLikelyToGive.ts`
**Purpose**: Localized likelihood to give values.
- `getLocalizedLikelyToGive(t, likelyToGive)` - Returns localized likelihood text

#### `src/utils/functions/getLocalizedNotificationStrings.ts`
**Purpose**: Localized notification settings.
- `getLocalizedNotificationType(t, type)` - Email, Mobile, Both
- `getLocalizedNotificationTimeUnit(t, unit)` - Days, Hours, Minutes

#### `src/utils/functions/getLocalizedSendNewsletter.ts`
**Purpose**: Localized newsletter preferences.
- `getLocalizedSendNewsletter(t, preference)` - Physical, Digital, Both, None

### 🎯 Task & Activity Management

#### `src/utils/phases/taskActivityTypes.ts`
**Purpose**: Activity type categorization and phase management.

**Activity Type Arrays**:
- `callActivityTypes` - Phone and video call activities
- `letterActivityTypes` - Physical mail activities  
- `emailActivityTypes` - Email-based activities
- `socialMediaActivityTypes` - Social media activities
- `textActivityTypes` - Text message activities
- `inPersonActivityTypes` - Face-to-face activities
- `electronicActivityTypes` - All digital activities
- `appointmentActivityTypes` - All appointment types

**Functions**:
- `getActivitiesByPhaseType(phase)` - Get activities for given phase
- `getPhaseByActivityType(activity)` - Get phase for given activity type

#### `src/utils/phases/getValueFromIdValue.ts`
**Purpose**: Extract values from IdValue objects.
- `getValueFromIdValue(idValue)` - Returns value property or empty string

#### `src/utils/tasks/taskFilterTabs.ts`  
**Purpose**: Task filtering tab configurations.
- `TaskFilterTabsTypes` - Type definition for tab types
- `getTaskFiltersTabs(t)` - Returns array of task filter tab configurations

---

## Shared Components (`src/components/Shared`)

### 📝 Form Components

#### Core Form Infrastructure

##### `src/components/Shared/Forms/FieldWrapper.tsx`
**Purpose**: Consistent form field layout wrapper.

**Component**: `FieldWrapper`
**Props**:
- `labelText?: string` - Auto-translated field label
- `helperText?: string` - Auto-translated helper text  
- `helperPosition?: HelperPositionEnum` - Helper text position
- `formControlDisabled?: boolean` - Disabled state
- `formControlError?: boolean` - Error state
- `formControlFullWidth?: boolean` - Full width layout
- `formControlRequired?: boolean` - Required field indicator

##### `src/components/Shared/Forms/FormWrapper.tsx`
**Purpose**: Form wrapper with integrated submit button.

**Component**: `FormWrapper`  
**Props**:
- `onSubmit: () => void` - Form submission handler
- `isValid: boolean` - Form validation state
- `isSubmitting: boolean` - Submission loading state
- `formAttrs?: object` - Additional form attributes
- `buttonText?: string` - Custom submit button text

##### `src/components/Shared/Forms/DialogActions.tsx`
**Purpose**: Left-aligned dialog actions.

**Component**: `DialogActionsLeft`
- Extends Material-UI DialogActionsProps
- Overrides default right alignment

##### `src/components/Shared/Forms/Field.tsx` & `FieldHelper.tsx`
**Purpose**: Styled form components and utilities.

**Styled Components**:
- `StyledFormLabel` - Consistently styled form labels
- `StyledFormHelperText` - Helper text with theme spacing
- `StyledOutlinedInput` - Styled outlined input component

**Enums**:
- `HelperPositionEnum` - Top, Bottom

#### Form Fields

##### `src/components/Shared/Forms/Fields/Input.tsx`
**Purpose**: Standardized input component.

**Component**: `Input`
**Props**: 
- `disabled?: boolean` - Disabled state
- `error?: boolean` - Error state  
- `fullWidth?: boolean` - Full width (default: true)
- `helperText?: string` - Helper text
- `label?: string` - Field label
- `required?: boolean` - Required indicator
- `select?: boolean` - Select dropdown mode
- `value?: string` - Field value

##### `src/components/Shared/Forms/Fields/Select.tsx`
**Purpose**: Select dropdown built on Input component.

**Component**: `Select`
**Props**:
- Extends InputProps
- `selectOptions: Array<{label: string, value: string}>` - Options array

#### Accordion Components

##### `src/components/Shared/Forms/Accordions/AccordionGroup.tsx`
**Purpose**: Section grouping for multiple accordions.

**Component**: `AccordionGroup`
**Props**:
- `title: string` - Section title
- `children?: ReactNode` - Accordion content

##### `src/components/Shared/Forms/Accordions/AccordionItem.tsx`
**Purpose**: Flexible accordion with responsive layouts.

**Component**: `AccordionItem<AccordionEnum>`
**Props**:
- `accordion: AccordionEnum` - Identifier
- `onAccordionChange: (accordion) => void` - Expansion handler
- `expandedAccordion: AccordionEnum | null` - Currently expanded
- `label: string` - Header label
- `value: string` - Header value/description
- `fullWidth?: boolean` - Full width layout
- `image?: ReactNode` - Optional image
- `disabled?: boolean` - Disabled state

**Styled Components**:
- `StyledAccordion` - Custom styling with borders
- `StyledAccordionSummary` - Header with yellow highlight when expanded
- Various responsive layout components

##### `src/components/Shared/Forms/Accordions/AccordionEnum.ts`
**Purpose**: Accordion type definitions.

**Enums**:
- `AccountAccordion` - Account-related accordions
- `AdminAccordion` - Admin interface accordions  
- `CoachAccordion` - Coaching feature accordions
- `IntegrationAccordion` - Integration settings accordions
- `OrganizationAccordion` - Organization management accordions
- `PreferenceAccordion` - User preference accordions

### 🔍 Filter System

#### Core Filter Components

##### `src/components/Shared/Filters/FilterPanel.tsx`
**Purpose**: Main filter panel container with advanced filtering.

**Component**: `FilterPanel`
- Complex filter management with GraphQL integration
- Save/delete filter functionality
- Tag-based filtering

##### `src/components/Shared/Filters/DynamicFilterPanel.tsx`
**Purpose**: Dynamically loaded filter panel.

**Component**: `DynamicFilterPanel` 
- Next.js dynamic import for performance

##### `src/components/Shared/Filters/FilterListItem.tsx`
**Purpose**: Dynamic filter component renderer.

**Component**: `FilterListItem`
**Props**:
- `filter: FilterItem` - Filter configuration
- `value?: FilterValue` - Current value
- `onUpdate: (value) => void` - Update handler
- `onReverseFilter?: () => void` - Reverse handler
- `reverseSelected?: boolean` - Reverse state

**Supported Filter Types**:
- TextFilter, RadioFilter, MultiselectFilter
- DateRangeFilter, CheckboxFilter, NumericRangeFilter

##### `src/components/Shared/Filters/FilterListItemShowAll.tsx`
**Purpose**: Toggle for filter visibility.

**Component**: `FilterListItemShowAll`
**Props**:
- `showAll: boolean` - Current state
- `onToggle: () => void` - Toggle handler

#### Specialized Filter Types

- `FilterListItemCheckbox.tsx` - Boolean filters
- `FilterListItemDateRange.tsx` - Date range pickers  
- `FilterListItemMultiselect.tsx` - Multi-selection with include/exclude
- `FilterListItemNumericRange.tsx` - Numeric range inputs
- `FilterListItemSelect.tsx` - Single selection dropdowns
- `FilterListItemSlider.tsx` - Slider-based ranges
- `FilterListItemTextField.tsx` - Text input filters
- `MultiselectFilterAutocomplete.tsx` - Autocomplete for multi-select

#### Filter Management

##### `src/components/Shared/Filters/SaveFilterModal/SaveFilterModal.tsx`
**Purpose**: Modal for saving custom filter sets.

##### `src/components/Shared/Filters/DeleteFilterModal/DeleteFilterModal.tsx`  
**Purpose**: Modal for deleting saved filters.

##### `src/components/Shared/Filters/TagsSection/`
**Purpose**: Filter tag management system.
- `FilterPanelTagsSection.tsx` - Main tags section
- `FilterTagChip.tsx` - Individual tag chips
- `FilterTagDeleteModal.tsx` - Tag deletion modal

#### Empty States

##### `src/components/Shared/Filters/NullState/NullState.tsx`
**Purpose**: Smart empty state for filtered views.

**Component**: `NullState`
**Props**:
- `page: 'contact' | 'task'` - Context
- `totalCount: number` - Total available items
- `title?: string` - Custom title
- `paragraph?: string` - Custom description

**Features**:
- Context-aware messaging
- Integrated create/import actions
- Search filter reset functionality

##### `src/components/Shared/Filters/NullState/NullStateBox.tsx`
**Purpose**: Styled container for null states.

#### Filter Utilities

##### `src/components/Shared/Filters/FilterPanelTypes.ts`
**Purpose**: TypeScript definitions for filter system.

##### `src/components/Shared/Filters/helpers.ts`  
**Purpose**: Filter utility functions.

### 🎛️ Layout & Navigation

#### Headers

##### `src/components/Shared/Header/ListHeader.tsx`
**Purpose**: Complex header for list views with filtering and mass actions.

**Component**: `ListHeader`
**Props**:
- `page: PageEnum` - Page context (Contact, Task, Report, Appeal)
- `headerCheckboxState: ListHeaderCheckBoxState` - Master checkbox state
- `filterPanelOpen: boolean` - Filter panel visibility
- `contactsView?: TableViewModeEnum` - View mode (List, Flows, Map)
- `totalItems?: number` - Item count
- `selectedIds: string[]` - Selected items

**Constants**:
- `headerHeight` - Standard header height value

**Enums**:
- `TableViewModeEnum` - List, Flows, Map
- `ListHeaderCheckBoxState` - Unchecked, Checked, Partial  
- `PageEnum` - Contact, Task, Report, Appeal

##### `src/components/Shared/Header/StarFilterButton/StarFilterButton.tsx`
**Purpose**: Star-based filtering button.

**Component**: `StarFilterButton`

##### `src/components/Shared/Header/styledComponents.ts`
**Purpose**: Styled components for headers.
- `StickyBox` - Sticky positioning container
- `StickyButtonHeaderBox` - Button header container
- `FilterButton` - Styled filter button

#### Multi-Page Layout

##### `src/components/Shared/MultiPageLayout/MultiPageHeader.tsx`
**Purpose**: Sticky header for multi-page layouts.

**Component**: `MultiPageHeader`  
**Props**:
- `isNavListOpen: boolean` - Navigation state
- `onNavListToggle: () => void` - Toggle handler
- `title: string` - Page title
- `headerType: HeaderTypeEnum` - Header type
- `rightExtra?: ReactNode` - Additional right content

**Enums**:
- `HeaderTypeEnum` - Report, Settings, Tools

##### `src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu.tsx`
**Purpose**: Multi-page navigation menu.

**Component**: `MultiPageMenu`

**Enums**:
- `NavTypeEnum` - Navigation type definitions

##### `src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenuItems.ts`
**Purpose**: Navigation item configurations.
- `NavItems` - Type for navigation items
- `reportNavItems` - Report navigation items
- `settingsNavItems` - Settings navigation items

##### `src/components/Shared/MultiPageLayout/MultiPageMenu/Item/Item.tsx`
**Purpose**: Individual navigation menu item.

**Component**: `Item`

### ⚙️ Action Components

#### Mass Actions

##### `src/components/Shared/MassActions/MassActionsDropdown.tsx`
**Purpose**: Base dropdown for bulk actions.

**Component**: `MassActionsDropdown`
**Props**:
- `handleClick: (event) => void` - Click handler
- `children: ReactElement` - Dropdown content
- `disabled?: boolean` - Disabled state
- `open: boolean` - Dropdown state

##### `src/components/Shared/MassActions/ContactsMassActionsDropdown.tsx`
**Purpose**: Contact-specific mass actions.

**Component**: `ContactsMassActionsDropdown`

##### `src/components/Shared/MassActions/TasksMassActionsDropdown.tsx`  
**Purpose**: Task-specific mass actions.

**Component**: `TasksMassActionsDropdown`

#### Contact Management

##### `src/components/Shared/HideContactsModal/HideContactsModal.tsx`
**Purpose**: Modal for hiding contacts.

**Component**: `HideContactsModal`

##### `src/components/Shared/HideContactsModal/DynamicHideContactsModal.tsx`
**Purpose**: Dynamically loaded hide contacts modal.

**Components**:
- `DynamicHideContactsModal` - Dynamic component
- `preloadHideContactsModal()` - Preload function

### 🎨 UI Enhancement Components

#### Display Components

##### `src/components/Shared/MultilineSkeleton.tsx`
**Purpose**: Multi-line loading skeleton.

**Component**: `MultilineSkeleton`
**Props**:
- `lines: number` - Number of skeleton lines
- Extends Material-UI SkeletonProps

##### `src/components/Shared/MinimalSpacingTooltip.tsx`
**Purpose**: Tooltip with reduced spacing.

**Component**: `MinimalSpacingTooltip` (default export)
- Extends Material-UI TooltipProps
- Custom Popper with reduced offset

#### Tags & Chips

##### `src/components/Shared/TagChip/TagChip.tsx`
**Purpose**: Styled chip for tags with selection states.

**Component**: `TagChip`
**Props**:
- `selectType: 'none' | 'include' | 'exclude'` - Selection state

Dynamic styling based on selection (blue for include, red for exclude, gray for none)

#### Contact Information

##### `src/components/Shared/CollapsibleContactInfo/CollapsibleList.tsx`
**Purpose**: Base collapsible list component.

**Component**: `CollapsibleList`

##### `src/components/Shared/CollapsibleContactInfo/CollapsibleEmailList.tsx`
**Purpose**: Collapsible email address list.

**Component**: `CollapsibleEmailList`

##### `src/components/Shared/CollapsibleContactInfo/CollapsiblePhoneList.tsx`
**Purpose**: Collapsible phone number list.

**Component**: `CollapsiblePhoneList`

##### `src/components/Shared/CollapsibleContactInfo/StyledComponents.ts`
**Purpose**: Shared styled components for contact info.

#### Links & Navigation

##### `src/components/Shared/Links/Links.tsx`
**Purpose**: Pre-configured external links.

**Components**:
- `PrivacyPolicyLink` - Privacy policy (uses PRIVACY_POLICY_URL)
- `TermsOfUseLink` - Terms of use (uses TERMS_OF_USE_URL)

#### Lists

##### `src/components/Shared/Lists/listsHelper.ts`
**Purpose**: Styled list components.
- `StyledListItem` - Consistent list item styling
- `StyledList` - List with themed bullets and spacing

#### Alerts

##### `src/components/Shared/alertBanner/AlertBanner.tsx`
**Purpose**: Fixed-position dismissible alert banner.

**Component**: `AlertBanner`
**Props**:
- `text: string` - Alert message (auto-translated)
- `severity?: string` - Alert type (error, info, success, warning)
- `localStorageName: string` - Unique identifier for persistence

---

## Quick Reference

### 🔥 Most Frequently Needed

| Function | Purpose | Location |
|----------|---------|-----------|
| `currencyFormat()` | Format currency values | `src/lib/intlFormat.ts` |
| `dateFormat()` | Format dates | `src/lib/intlFormat.ts` |
| `getQueryParam()` | Extract URL params safely | `src/utils/queryParam.ts` |
| `snakeToCamel()` | Convert object keys | `src/lib/snakeToCamel.ts` |
| `sourceToStr()` | Convert source codes | `src/utils/sourceHelper.ts` |
| `FieldWrapper` | Form field wrapper | `src/components/Shared/Forms/FieldWrapper.tsx` |
| `ListHeader` | List page header | `src/components/Shared/Header/ListHeader.tsx` |

### 🎯 GraphQL & Data

| Function | Purpose | Location |
|----------|---------|-----------|
| `createCache()` | Apollo cache setup | `src/lib/apollo/cache.ts` |
| `makeClient()` | Apollo client setup | `src/lib/apollo/client.ts` |
| `fetchAllData()` | JSON API deserialization | `src/lib/deserializeJsonApi.ts` |
| `filterNullValues()` | Clean null values | `src/lib/removeObjectNulls.ts` |

### 🎨 UI Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `FilterPanel` | Advanced filtering | `src/components/Shared/Filters/FilterPanel.tsx` |
| `AccordionItem` | Flexible accordions | `src/components/Shared/Forms/Accordions/AccordionItem.tsx` |  
| `NullState` | Empty state handling | `src/components/Shared/Filters/NullState/NullState.tsx` |
| `MultiPageHeader` | Page headers | `src/components/Shared/MultiPageLayout/MultiPageHeader.tsx` |

---

## Usage Guidelines

### ✅ Best Practices

1. **Always use internationalization**: Use `intlFormat` functions for displaying numbers, currency, and dates
2. **Leverage existing components**: Check `src/components/Shared` before creating new UI components  
3. **Follow established patterns**: Use `FieldWrapper` for form fields, `ListHeader` for list pages
4. **Type safety first**: Import enums and types from the appropriate files
5. **Performance**: Use dynamic imports for heavy components when possible

### 🚫 Common Mistakes to Avoid

1. **Don't reinvent**: Always check if functionality already exists in these shared resources
2. **Don't skip error handling**: Use `getErrorMessage()` for consistent error handling
3. **Don't hardcode**: Use utilities like `sourceToStr()` instead of hardcoding mappings
4. **Don't ignore localization**: Always use translation functions for user-facing text

### 🔧 Import Examples

```typescript
// Formatting
import { currencyFormat, dateFormat } from 'src/lib/intlFormat';

// Data transformation  
import { snakeToCamel } from 'src/lib/snakeToCamel';
import { getQueryParam } from 'src/utils/queryParam';

// Components
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { ListHeader } from 'src/components/Shared/Header/ListHeader';
import { FilterPanel } from 'src/components/Shared/Filters/FilterPanel';

// Apollo setup
import { createCache } from 'src/lib/apollo/cache';
import makeClient from 'src/lib/apollo/client';
```

This documentation should serve as your primary reference when building features in MPDX. Always prefer these shared resources over creating duplicate functionality.