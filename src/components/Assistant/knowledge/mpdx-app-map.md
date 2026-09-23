# MPDX App Map

This document describes the MPDX web application (mpdx.org) as a user sees it. It is derived from the application source code and is intended to help an assistant answer "where do I find..." and "how do I..." questions for MPDX users.

Vocabulary used throughout: MPDX users are missionaries doing MPD (ministry partner development, that is, fundraising). "Contacts" are ministry partners, donors, and prospective partners. An "account list" is a user's workspace; almost every page lives under a URL of the form `/accountLists/{accountListId}/...`. "Tasks" are the to-do items and logged activity (calls, appointments, letters, and so on). "Appeals" are one-time fundraising campaigns.

---

## 1. Global layout

Every page inside an account list shares the same dark top bar. On narrow screens the top bar collapses to a hamburger icon that opens a side drawer containing the same items.

### Top bar (left to right)

1. **MPDX logo.** Returns to the Dashboard of the current account list.
2. **Main navigation menu.** The row of links and dropdowns:
   - **Dashboard** (link)
   - **Contacts** (link)
   - **Tasks** (link)
   - **Reports** (dropdown listing every report; see section 6)
   - **HR Tools** (dropdown; shown only to Cru US staff and hybrid staff who are eligible for at least one tool; see HR Tools in section 2)
   - **MPDX Tools** (dropdown grouped into Appeals, Contacts, People, Imports; see section 7). Tool entries that have contacts needing attention show a yellow count badge, and the Tools menu itself shows the total.
   - **Coaching** (link; shown only when the user has been given coaching access to at least one other account list)
3. **Search (magnifying glass).** Opens a search dialog. As you type, it shows matching contacts (by name), and matching pages (Contacts, Tasks, each report as "Reports - {name}", each HR tool as "HR Tools - {name}", each tool as "MPDX Tools - {name}", and each settings page as "Preferences - {name}"). If more contacts match than are shown, an "And N more" entry opens the Contacts page with that search term. If no contact matches, it offers "Create a new contact for "{typed text}"" which creates the contact and opens it.
4. **Add (plus icon).** A quick-add menu with five options:
   - **Add Contact** (opens the New Contact dialog: name, and optionally people and details)
   - **Add Multiple Contacts** (a wide dialog with a grid for entering many contacts at once)
   - **Add Donation** (record a gift manually: partner, amount, currency, date, designation, appeal, method, memo)
   - **Add Task** (opens the task dialog in "Add Task" mode)
   - **Log Task** (opens the task dialog in "Log Task" mode, for recording something already done)
5. **Notifications (bell).** A panel titled "Notifications" (with an unread count) listing partner-related alerts. Each item can be acknowledged; "Mark all as read" clears them; "Load More" pages through history. Clicking a notification opens the related contact. Notification types include: started giving, missed a gift (stopped giving), recontinued giving, gave a special gift, gave a larger or smaller gift than their commitment, a semi-annual or larger gift is expected one month from now, no call logged in the past year, no thank-you note logged in the past year, upcoming birthday, upcoming anniversary, missing address or email for the newsletter, a new partner added through the Give Site subscription form (with or without a duplicate merged), new address, and MailChimp bounce or unsubscribe.
6. **Profile menu (user's avatar or name).** Shows the current account list name and, when the user has several account lists, an **Account List Selector** to switch between them (switching keeps you on an equivalent page). Then links to **Preferences**, **Notifications**, **Connect Services**, **Manage Accounts**, **Manage Coaches**, and, for admins, **Manage Organizations** and **Admin Console**. Finally **Sign Out**. If an admin is impersonating another user, a "Stop Impersonating" option appears instead.

### Help beacon (Helpjuice)

A floating life-preserver icon sits in the lower right corner of every page. Clicking it opens the MPDX help center (Helpjuice) in a panel where the user can search help articles without leaving the page. Article titles link to the full article in a new tab. The panel also has a **Contact Us** link which opens the MPDX support form with the user's name, email, and current page pre-filled. The beacon can be dismissed; dismissal is remembered as a user preference. (The beacon only appears when the help center is configured for that environment, which it is in production.)

### Setup tour

New users are guided through a short setup tour (see Setup/onboarding in section 2). While on the tour, the top bar hides the navigation, search, add, and notifications items, and the preference pages show only the step being completed with a "Skip Step" option.

---

## 2. Route map

All account-list pages start with `/accountLists/{accountListId}`; that prefix is abbreviated as `...` below. A segment in braces is a variable. Page titles are what the browser tab and page heading show.

### Sign in, account choice, onboarding

| URL | Page | Purpose | Main actions |
| --- | --- | --- | --- |
| `/` | (redirect) | Sends signed-in users to their default account list, otherwise to login. | none |
| `/login` | Sign In | Sign in with the ministry single sign-on (Okta). | Sign in |
| `/logout` | Logout | Signs the user out. | none |
| `/accountLists` | Account Lists | Choose which account list to work in (shown when the user has more than one and no default). | Click an account list |
| `/acceptInvite` | Accept Invite | Landing page from an invitation email; accepts an invitation to share an account list (as account holder or coach) or to administer an organization. | Automatic accept, then redirect |
| `/account_lists/{id}/accept_invite/{inviteId}` and `/organizations/{orgId}/accept_invite/{inviteId}` | (redirect) | Legacy invite links that redirect to the Accept Invite page. | none |
| `/setup/start` | Setup - Start ("It's time to get started") | First step of the new-user tour: confirm language and accept the terms by clicking "Let's Begin!". | Choose language, begin |
| `/setup/connect` | Setup - Get Connected ("It's time to connect!") | Connect an organization account (the donation system) so gifts flow in; the user enters organization credentials. | Add Organization Account, disconnect, continue |
| `/setup/account` | Setup - Default Account ("Set default account") | Choose which account list is the default when several exist. | Pick account, Continue Tour |
| `.../settings/preferences?setup=...` | Preferences (tour steps) | Tour steps for Locale, Monthly Goal, Geographic Location (are you within 50 miles of a major city?), and Home Country. | Save each, Skip Step |
| `.../settings/notifications` (tour) | Notifications | Tour step to choose notification types. | Save, Skip Step |
| `.../settings/integrations` (tour) | Connect Services | Tour step to connect Google, MailChimp, and prayerletters.com. | Connect, Next Step |
| `.../setup/finish` | Setup - Finish ("Congratulations! You're all set!") | Offers to import data now from TntConnect, Google Contacts, or a spreadsheet. | "Yes! Import my stuff!" (goes to Tools with setup mode) or "Nope, I'm all done! Take me to MPDX" |

The app automatically sends users back into the tour if they have no account list, no organization account, or no default account list.

### Dashboard

| URL | Page | Purpose | Main actions |
| --- | --- | --- | --- |
| `...` (account list root) | Dashboard (titled with the account list name) | Overview of giving and this week's work. Sections: Welcome ("Welcome back to MPDX. Here's what's been happening."), **Monthly Goal** (goal, gifts started, commitments, gifts not started, above/below goal), **Account Balance** ("It may take a few days to update", with a View Gifts link to the Donations report), **Monthly Giving** chart (goal, committed, and average lines against actual by month), and **To Do This Week**: Tasks Due This Week, Late Commitments, Prayer requests, Celebrations (birthdays and anniversaries), Connections (referrals) On Hand and Recent, Appeals (primary appeal progress), and Weekly Activity (initiations, appointments, follow-up, partner care, connections, gifts received, commitments). | Complete or log tasks from the list, View All links to filtered Contacts/Tasks pages, **Log Newsletter** (records that a physical or digital newsletter was sent, with optional contact export for mailing labels), **Fill out weekly report** (coaching weekly report, if the organization has set up questions), View Activity Detail |

### Contacts

| URL | Page | Purpose | Main actions |
| --- | --- | --- | --- |
| `.../contacts` | Contacts | The main list of ministry partners with a filter panel on the left and a detail panel on the right. | Search, filter, star, select and run bulk actions, switch view, open a contact |
| `.../contacts/{contactId}` | Contacts (with contact open) | Same list with the contact's detail panel open on the right. | Everything in section 4 |
| `.../contacts/flows` | Contact Flows | Kanban-style column view of contacts by status. Drag a contact between columns to change its status. | Drag to change status, open contact |
| `.../contacts/flows/{contactId}` | Contact Flows (with contact open) | Flows view plus detail panel. | as above |
| `.../contacts/flows/setup` | Contact Flows Setup | Design the flow columns: add columns, name them, assign statuses, reorder; "Unused Statuses" shows statuses not yet in any column. | Add Column, drag statuses, Reset to Defaults (US or Global default sets), Confirm |
| `.../contacts/map` | Contacts Map | Google map of the currently filtered contacts, grouped as "Partners by Status"; contacts without a geocoded address are listed under "Could Not Be Located". | Click a pin to Show Contact, toggle status groups |
| `.../contacts/map/{contactId}` | Contacts Map (with contact open) | Map plus detail panel. | as above |

### Tasks

| URL | Page | Purpose | Main actions |
| --- | --- | --- | --- |
| `.../tasks` | Tasks | List of all tasks with a filter panel on the left. Quick tabs: All Tasks, Overdue, Completed, Today, Upcoming, No Due Date. Rows are grouped by Overdue, Today, Upcoming, No Due Date, Completed. | Add Task, Log Task, complete a task (check icon), edit, comments, delete; select many for bulk actions |
| `.../tasks/{contactId}` | Tasks (with contact open) | Tasks list with a contact's detail panel open on the right. | as above |

### Reports

All reports are also listed in a left-hand "Reports" side menu on each report page.

| URL | Page | Purpose |
| --- | --- | --- |
| `.../reports/donations` | Donations | Month-by-month list of every gift received. |
| `.../reports/partnerCurrency` | 14 Month Partner Report (Contributions by Partner Currency) | Grid of each partner's gifts over the last 14 months in the currency the partner gives in. |
| `.../reports/salaryCurrency` | 14 Month Salary Report (Contributions by Salary Currency) | Same grid converted into the user's salary currency. |
| `.../reports/staffExpense` | Staff Expense Report | Income and expense transactions on the staff account (US and hybrid staff with a staff account). |
| `.../reports/mpgaIncomeExpenses` | Income/Expense Analysis (Ministry Partner Giving Analysis) | 12-month income and expense analysis by category (US and hybrid staff with a staff account). |
| `.../reports/designationAccounts` | Designation Accounts | Balances of each designation account tied to the account list. |
| `.../reports/financialAccounts` | Responsibility Centers | List of financial accounts (responsibility centers) with balances (global and hybrid staff). |
| `.../reports/financialAccounts/{id}` | Summary Report - Responsibility Centers | Income, expenses, and surplus/deficit summary for one center. |
| `.../reports/financialAccounts/{id}/entries` | Transactions Report - Responsibility Centers | Individual transactions for one center. |
| `.../reports/expectedMonthlyTotal` | Expected Monthly Total | What is likely to come in this month: received so far, likely, and possible partners. |
| `.../reports/partnerGivingAnalysis` | Partner Giving Analysis | Per-partner giving statistics over a chosen period. |
| `.../reports/coaching` | Coaching | The coaching report for the user's own account list (same layout as the Coaching detail page). |

Reports that open a contact panel (donations, 14 month, expected monthly total, partner giving analysis) accept `/{contactId}` at the end of the URL.

### Tools

| URL | Page | Purpose |
| --- | --- | --- |
| `.../tools` | MPDX Tools | Landing page listing every tool as a card with a description and, where relevant, a count of items needing attention. |
| `.../tools/appeals` | Appeals | List of appeals, with the primary appeal highlighted, and a form to add a new appeal. |
| `.../tools/appeals/appeal/{appealId}` | Appeals (one appeal) | Track one appeal: Flows View (columns Excluded, Asked, Committed, Received, Given) or List View, plus goal progress and export. Optional URL segments: `/{appealId}/list` or `/{appealId}/flows`, then an optional `/{contactId}`. |
| `.../tools/fix/commitmentInfo` | Fix Commitment Info | Confirm or correct the status, amount, currency, and frequency that MPDX guessed for partners. |
| `.../tools/fix/mailingAddresses` | Fix Mailing Addresses | Choose the primary mailing address for contacts that have several. |
| `.../tools/fix/sendNewsletter` | Fix Send Newsletter | Set a newsletter preference for partners who have none. |
| `.../tools/fix/emailAddresses` | Fix Email Addresses | Choose the primary email for people who have several. |
| `.../tools/fix/phoneNumbers` | Fix Phone Numbers | Choose the primary phone for people who have several. |
| `.../tools/merge/contacts` | Merge Contacts | Review likely duplicate contacts and merge them. |
| `.../tools/merge/people` | Merge People | Review likely duplicate people within contacts and merge them. |
| `.../tools/import/csv` | Import from CSV | Four-step spreadsheet import wizard. |
| `.../tools/import/google` | Import from Google | Import Google Contacts, all or by group/label. |
| `.../tools/import/tnt` | Import from TntConnect | Upload a TntConnect export file. |

Fix and merge tool URLs accept `/{contactId}` at the end to open a contact panel.

### Coaching

| URL | Page | Purpose |
| --- | --- | --- |
| `.../coaching` | Coaching Accounts | List of the account lists the user coaches, each with balance, monthly goal progress, and primary appeal progress. |
| `.../coaching/{coachingId}` | Coaching (one account) | Read-only coaching view of another missionary's account: sidebar with Balance, Staff IDs, Last Prayer Letter, MPD Info (start date, end date, weeks on MPD, monthly commitment goal), Users, Coaches (with Remove Access); main area with Monthly Commitment chart, Appointments and Results, Level of Effort (My Part), Outstanding Recurring Commitments, Outstanding Special Needs, Partners Progress (financial, special gift, prayer partners; new connections, monthly support gained and lost), Contact Tags and Task Tags summaries, and Weekly Report answers. |
| `.../coaching/{coachingId}/nsGoalCalculator` | New Staff Goal Calculator (coach view) | View the coached new staff member's goal calculation. |

### Settings

Every settings page has a left "Settings" side menu listing these pages. Pages open a specific accordion when the URL includes `?selectedTab={accordionName}`.

| URL | Page | Purpose |
| --- | --- | --- |
| `.../settings/preferences` | Preferences | Personal Preferences (Language, Locale, Default Account, Time Zone, Hour To Send Notifications) and Account Preferences (Account Name, Monthly Goal, Geographic Location, Home Country, Default Currency, MPD Info, Primary Organization, Early Adopter, Export All Data). Also "Reset Welcome Tour". |
| `.../settings/notifications` | Notifications ("Setup your notifications here") | Table of notification types with checkboxes for In App, Email, and Task delivery. |
| `.../settings/integrations` | Connect Services ("Make MPDX a part of your everyday life") | Okta, Organization accounts, then External Services: Google, MailChimp, prayerletters.com, Chalkline. |
| `.../settings/manageAccounts` | Manage Accounts | Share the account list with others, manage pending invites, merge your own accounts, merge spouse accounts. |
| `.../settings/manageCoaches` | Manage Coaches | Invite and remove coaches for this account list. |
| `.../settings/organizations` | Manage Organizations (Impersonate & Share) | Admin only: impersonate a user in the organization, invite organization administrators. |
| `.../settings/organizations/accountLists` | Organizations Account Lists | Admin only: search account lists in the organization; view users, coaches, designation accounts; delete accounts or users. |
| `.../settings/organizations/contacts` | Organizations Contacts | Admin only: search contacts across the organization and anonymize a contact. |
| `.../settings/admin` | Admin Console | Admin/developer only: Impersonate User (by Okta username or email, with a reason) and Reset Account. |

### HR Tools (Cru US staff only)

Visibility of each tool depends on the staff member's HR group; see notes.

| URL | Page | Purpose |
| --- | --- | --- |
| `.../hrTools/salaryCalculator` and `/{calculationId}` | Salary Calculation Form | Multi-step form to calculate and submit a salary request (senior staff, national expats). |
| `.../hrTools/staffSavingFund` and `/transfers` | Savings Fund Transfer / Staff Savings Fund Transfers | Set up one-time or recurring transfers to or from staff savings funds (any staff account). |
| `.../hrTools/nsGoalCalculator` | New Staff Goal Calculator | Goal calculation for new staff. |
| `.../hrTools/nsoMpdQuestionnaire` | NSO MPD Questionnaire | New staff orientation questionnaire (dependents, debt, housing, sessions, and so on). |
| `.../hrTools/goalCalculator` and `/{goalCalculationId}` | MPD Goal Calculator | Step-by-step calculation of the monthly support goal (senior staff). |
| `.../hrTools/mpdGoalAdmin` (plus `/scenario/{id}` and `/staff/{id}`) | MPD Goal Calculator Admin Table | Admin table for managing goals across a training cohort and running scenario goals. |
| `.../hrTools/mhaCalculator` and `/{requestId}` | MHA Calculation Tool | Minister's housing allowance request. |
| `.../hrTools/additionalSalaryRequest` | Additional Salary Request | Request additional salary for approved expense categories. |
| `.../hrTools/pdsGoalCalculator` and `/{pdsGoalId}` | Paid with Designation Support Goal Calculator | Goal calculator for staff paid with designation support. |
| `.../hrTools/partnerReminders` | Ministry Partner Reminders | Online Reminder System: list of ministry partners with last gift, last reminder, and reminder status, for the account's designation number. |
| `.../hrTools/mpdSupervisorReport` | MPD Supervisor Report | For supervisors: a table of supervised staff sorted by MPD health. |

### Error pages

`/404` (page not found) and `/500` (server error).

---

## 3. URL state, filters, and views

### How filters live in the URL (Contacts and Tasks)

- **`filters`** query parameter: a JSON object of the active filters, for example `?filters={"status":["PARTNER_FINANCIAL"],"tags":["church"]}`. Because it is in the URL, a filtered view can be bookmarked or shared with someone who has access to the same account list. Clearing all filters removes the parameter.
- **`searchTerm`** query parameter: the text typed in the search box above the list (`?searchTerm=smith`). The search dialog's "And N more" link opens the Contacts page with this parameter.
- **Starred** filter (the star toggle in the list header) is applied in memory only and is not put in the URL.
- **`tab`** query parameter: which tab of the open contact's detail panel is showing (`Tasks`, `Donations`, `Referrals`, `ContactDetails`, `Notes`). Omitted when the default tab is showing.
- The **open contact** is part of the path, not the query: `.../contacts/{contactId}`, `.../contacts/flows/{contactId}`, `.../contacts/map/{contactId}`, `.../tasks/{contactId}`, and for reports and tools, the same `/{contactId}` suffix.
- **Saved filters** (a name the user gives to a set of filters) are stored as user preferences, not in the URL. The filter panel lists them under "Saved Filters"; the "Save Filter" button saves the current set.

### Contacts view modes

The Contacts page has a three-icon view toggle on the right of the list header (List View, Column Workflow View, Map View). The chosen view is remembered per user and encoded as the first path segment after `/contacts`. While in the column view, a **View Settings** button next to the toggle opens the Contact Flows Setup page.

- **List View** (`.../contacts`): a row per contact showing avatar, name, status, city/state, commitment amount and frequency, newsletter setting, late indicator, number of uncompleted tasks, and a star.
- **Column Workflow View** (`.../contacts/flows`): columns of contacts grouped by status. Dragging a contact card to another column updates its status ("Contact status updated!"). Column definitions are user-configurable on the Flows Setup page; the default US set has columns named by phase (Connection, Initiation, Appointment, Follow-Up, Partner Care, Archive) and the Global default set has Contacts, Call Backs, Appointments, Future Contacts, Maintaining.
- **Map View** (`.../contacts/map`): a map of the filtered contacts; the left panel switches to a legend of statuses (Toggle Contact List). The map loads all matching contacts rather than a page at a time.

The filter panel can be shown or hidden with the funnel icon; the open/closed state is remembered per user.

### The filter panel (contacts)

The panel shows "Filter" (or "Filter (N active)"), a **Saved Filters** section, a **Tags** section (click a tag once to include it; click it twice to look up contacts who do NOT have that tag; "any" versus "all" toggle), and then groups of filters. Frequently used groups are shown first; "See More Filters" reveals the rest. Each filter has a "Reverse Filter" option to invert it. "Clear All" resets everything. The groups and filters, with their user-visible names:

- **Status** (multi-select of partner statuses plus "-- All Active --", "-- All Hidden --", "-- None --")
- **Newsletter Recipients**: Nothing Selected, None, All, Physical and Both, Digital and Both, Physical Only, Digital Only, Both Only
- **Pledge Status**: All, Outstanding, Completed, Pending
- **Starred**, **Referrer** (connecting partner), **Appeal**, **Appeal Status**, **Assignee**, **Timezone**, **Account List**
- **Gift Details**: Gift Options (No Gifts, One or More Gifts, First Gift, Last Gift), Gift Date (Last 30 Days, Last Month, Last Two Months, Last Three Months, Last Year, This Month, This Year, or a custom range), Exact Gift Amount, Gift Amount Range, Next Ask, Designation Account; and period statistics Gift Average, Gift Count, Gift Total, Gift Percentage
- **Commitment Details**: Commitment Amount, Commitment Currency, Commitment Frequency (Weekly, Every 2 Weeks, Monthly, Every 2 Months, Quarterly, Every 4 Months, Every 6 Months, Annual, Every 2 Years), Commitment Received (Received / Not Received), Late By (Less than 30 days late, 30-60, 60-90, More than 90 days late)
- **Contact Details**: Type (Person / Company), Church, Likely To Give (Least Likely, Likely, Most Likely), Language, Alma Mater, Birthday, Anniversary, Created At, Created By (source)
- **Contact Information**: Email, Home Phone, Mobile Phone, Work Phone, Facebook Profile, Opted Out of Email
- **Contact Location**: Address, Address Type, Address Is Primary, Address No Longer Valid, City, State, Region, Metro Area, Country
- **Tasks**: Action (task type, or Any / None), Due Date (Yesterday, Today, Tomorrow, This Week, Next Week, This Month, Next Month), No Incomplete Tasks
- **Search Notes**: Notes (text search inside contact notes)
- **Predefined Filters** (one-click sets): Gave One or More Gifts, Gave in the Last 2 Years, Lost Partners, Last Full 12 Months, Last Full Month, Month to Date, Year to Date

### The filter panel (tasks)

The tasks page uses the same panel with task filters: Action (task type), Result, Next Action, Tags and Contact Tags, Assignee, Starred, Overdue, Date Range (overdue, today, upcoming, no date; set by the quick tabs), Date Range Search (Due Date, Date Completed, Date Created), Contacts, and contact-based filters (Contact Status, Contact Newsletter, Contact Appeal, Contact Church, Contact Likely To Give, Contact Referrer, Contact Timezone, Contact Type, plus location fields).

### Selection and bulk actions

Checking rows enables a **N Selected** counter and an **Actions** menu.

Contacts bulk actions: Export (Export Contacts or Export Emails), Merge (requires at least 2 selected; you choose which contact wins), Add Tags, Remove Tags, Add Task, Log Task, Edit Fields (change status, likely to give, starred, newsletter, send appeals, church, website, assignee, language, and similar fields for all selected), Hide Contacts, Add to Appeal, Add to New Appeal.

Tasks bulk actions: Complete Tasks, Edit Tasks, Add Tag(s), Remove Tag(s), Delete Tasks.

**Export Contacts** options: Advanced CSV (all information, best for sorting and importing elsewhere), Advanced Excel (XLSX), CSV for Mail Merge (addresses formatted by country), PDF of Mail Merged Labels (templates Avery 5160 or Avery 7160; sort by Contact Name or Zip). **Export Emails** copies the primary email of every person in the selected contacts, skipping anyone marked "Opted out of Digital Newsletter", with a reminder to use the Bcc field and a note that Outlook needs semicolons.

---

## 4. Contact detail panel

Opening a contact (from Contacts, Tasks, Flows, Map, a report, a tool, search, or a notification) slides in a detail panel on the right (about 60 percent of the width) without leaving the page. Its URL is the page URL plus `/{contactId}`.

### Header

- Avatar, contact name, and a **star** toggle.
- **Partner** status line with a handshake icon, commitment amount and frequency, and an **Edit Partnership Info** pencil that opens the partnership dialog.
- Primary phone, email, and address (address links to Google Maps), and the **Newsletter** setting.
- If MPDX has detected a possible duplicate, a yellow bar says "It looks like this contact may have a duplicate" with **See Match** (opens the Merge Contacts tool for this pair) and **Dismiss Duplicate**.
- **More Actions** menu: Add Task, Log Task, Add Connections (record who this contact referred), Hide Contact (asks for confirmation; hidden contacts get the status "Never Ask" and are hidden from normal lists), Delete Contact (asks for confirmation; contacts that came from a donation system cannot be deleted here and the dialog says to email Donation Services instead).
- **Close** (X) returns to the list.

### Tabs

1. **Tasks**: this contact's tasks with a search box, "Add New Task" and "log task" buttons, complete/edit/comment icons per task, and bulk selection. Shows "No tasks can be found for this contact" when empty.
2. **Donations**: at the top, the **Partnership Info** card (Status, Commitment amount and currency, Frequency, Commitment Received yes/no, Start Date, Likely To Give, Newsletter, Send Appeals yes/no, Next Increase Ask, Connecting Partner, Relationship Code, Primary Person, Method, Last Gift Date and Amount, Lifetime Gifts, Gift Average) with an Edit Partnership pencil. Below, a giving graph (previous 12 months versus previous 13 to 24 months, with averages) and a table of this contact's donations (date, amount, currency, designation, method, appeal) with an edit icon per donation.
3. **Connections** (referrals): people this contact has connected you with, with Date of Connection and a Remove Connection action, and an **Add Connections** button.
4. **Contact Details**: the editable profile in sections:
   - **People**: each person in the household with name, birthday, anniversary, phone numbers (type: mobile, home, work; primary flag), email addresses (type; primary flag; "Opt-out of Digital Newsletter"), social accounts (Facebook, LinkedIn, Instagram, other), gender, marital status (Married, Engaged, Divorced, Deceased, and so on), occupation, employer, alma mater, legal first name, and an avatar. Actions: Add Person, Edit Person, Delete, Merge Selected People.
   - **Addresses** (Mailing): each address with street, city, state, zip, country, metro, region, location type, "Address no longer valid" flag, and a primary indicator; plus Envelope Name Line and Greeting. Actions: Add Address, Edit Address, Edit Mailing Information.
   - **Other**: Church, Website, Language, Time Zone, Preferred Contact Method (Phone Call, SMS, Email, Facebook, Instagram, WhatsApp, WeChat), Connecting Partner, Assignee (user responsible), Envelope Name, Greeting. Action: Edit Contact Other Details.
   - **Partner Accounts**: donor account numbers from connected organizations. Actions: Add Partner Account (Account Number), Delete.
   - **Tags**: chips for the contact's tags, with "add tag" and a remove X per tag.
5. **Notes**: a free-text area ("Add contact notes") that auto-saves and shows "Last updated".

### Edit Partnership Info dialog

Fields: Status (grouped by phase), Commitment Amount, Currency, Frequency, Commitment Received, Start Date, Likely To Give, Newsletter (Physical, Email, Both, None), Send Appeals, Next Increase Ask date, Connecting Partner, Relationship Code, Primary Person, Method, Contact Name. Saving shows "Partnership information updated successfully."

---

## 5. Task workflows

### What a task is

A task belongs to a phase of the partner journey and has a type ("Action"), an optional subject, contacts, assignee, due date and time, tags, and comments. When completed it also has a result and optional next action, and completing a task can update each contact's status.

### Phases and task types (Actions)

- **Initiation**: Phone Call, Email, Text Message, Social Media Message, Letter, Special Gift Appeal, In Person (labelled "Initiation - Phone Call" and so on)
- **Appointment**: In Person, Phone Call, Video Call
- **Follow Up**: Phone Call, Email, Text Message, Social Media Message, In Person
- **Partner Care**: Phone Call, Email, Text Message, Social Media Message, In Person, Thank, Digital Newsletter, Physical Newsletter, Prayer Request, Update Information, To Do
- A task can also have no action ("None").

### Results and next actions

Results depend on the phase. Initiation results: No Response Yet, Can not meet right now - circle back, Appointment Scheduled, Not Interested (plus attempted, left message, completed, received, sent for some types). Appointment results: Cancelled, Follow Up, Partner - Financial, Partner - Special, Partner - Pray, Not Interested. Follow Up results: No Response Yet, Partner - Financial, Partner - Special, Partner - Pray, Not Interested. Partner Care result: Completed. When a result implies a new partner status (for example "Partner - Financial" after an appointment) the dialog suggests updating the contact status, and shows "Suggested Tags" for the phase (for example "asked for support", "asked for connections", "asked for advocacy", "asked for increase" on appointments; "Financial Support", "Gift not Started", "Special Gift", "Connections", "Increase" on follow-up).

### The task dialog

One dialog with five modes:

- **Add Task** (from the plus menu, Tasks page header, contact More Actions, or contact Tasks tab): fields Task Type (phase), Action, Task Name (subject), Contacts, Assignee, Due Date and Due Time, Tags, Comment, and Reminders (amount of time before, unit in days/hours/minutes, how it is sent: Email, Mobile, Both; "If blank you will not be reminded"). Saving shows "Task(s) saved successfully".
- **Log Task** (record something already done): Task Type, Action, Task Name, Contacts, Result, Next Action (which creates a follow-up task), Completed Date and Time, Tags, Comment, and "Show More" for Assignee and Location. Saving shows "Task(s) logged successfully" and may update contact statuses.
- **Complete Task** (check icon on a task row): Result, Next Action, Completed Date and Time, Additional Tags, Add New Comment; shows the subject and contacts.
- **Edit Task**: same fields as Add, plus a delete button.
- **Task Comments**: view and add comments on a task.

### The Tasks page

Header buttons **Add Task** and **Log Task**, quick tabs **All Tasks, Overdue, Completed, Today, Upcoming, No Due Date**, a search box ("Search Tasks"), a star filter, and the filter panel. Each row shows a checkbox, star, subject, contact name(s), tags, assignee, due date, a complete (check) icon, and an edit icon; clicking the contact name opens the contact panel. Completed tasks are listed last.

---

## 6. Reports

| Report | Question it answers | Key controls |
| --- | --- | --- |
| **Donations** | Which gifts came in during a given month? | Previous Month / Next Month; table columns Date, Partner, Partner No., Amount, Foreign Amount, Designation, Method, Appeal; click a partner to open their panel; edit icon to correct a gift; Donation Totals per currency at the bottom. Empty state: "Add Donation" or "Connect Services". |
| **14 Month Partner Report** (Partner Currency) | What did each partner give in each of the last 14 months, in their own currency? | Rows per partner grouped by currency; columns per month plus Totals, 12 Month Total, Avg, Min; Status and Commitment shown; Expand User Info toggles partner details; Export / Download CSV / Print; late partners flagged as "N+ days late". Empty: "You have received no donations in the last fourteen months". |
| **14 Month Salary Report** (Salary Currency) | Same as above, converted into the salary currency. | same |
| **Staff Expense Report** | What income and expenses posted to my staff account, and what is my balance? | Month navigation; Income Report, Expense Report, Combined Report views; categories with breakdowns; starting and ending balance; Export CSV, Print; spouse account toggle. |
| **Income/Expense Analysis** (Ministry Partner Giving Analysis, MPGA) | Over the last 12 months, where did income come from and where did expenses go, by category? | Summary, Income, Expenses tabs; Monthly Summary; Filters and Columns controls; Export CSV, Print. |
| **Designation Accounts** | What is the balance of each designation account? | List with Balance; toggle which accounts are active for the account list. Empty: "You have no designation accounts". |
| **Responsibility Centers** | What financial accounts (centers) do I have and what are their balances? | List grouped by organization; click a center for its Summary (Income, Expenses, Surplus/Deficit, Opening Balance by period) and Transactions (Date, Payee, Memo, Category, Inflow, Outflow, Balance; search by description, code, category). Filter panel by date range and categories; Export CSV. |
| **Expected Monthly Total** | How much can I expect this month? | Three sections: Donations So Far This Month (Received), Likely Partners This Month, Possible Partners This Month; each row shows Partner, Status, Commitment, Frequency, Converted amount; totals per section. Click a partner to open their panel. |
| **Partner Giving Analysis** | Which partners gave how much, how often, and when, over a period? | Report Filters panel (date range, status, tags, and the standard contact filters); table with Name, Status, Gift Count, Gift Total, Gift Average, Lifetime Total, First Gift Date, Last Gift Date, Last Gift Amount, Commitment Amount; sortable columns; select rows for bulk actions; Print; Keyboard Shortcuts help. |
| **Coaching** | How is my MPD going, in the format a coach sees? | Same layout as the coaching detail page (section 2, Coaching). |

Some reports are hidden depending on staff type: Staff Expense and Income/Expense Analysis need a Cru US staff account; Responsibility Centers is for global and hybrid staff.

---

## 7. Tools

The **MPDX Tools** landing page shows cards grouped as Appeals, Contacts, People, and Imports. Cards for fix and merge tools show how many items need attention; the same counts appear as badges in the Tools dropdown.

### Appeals

Use appeals to set a goal, ask specific partners, and track progress for a one-time need.

- **Appeals list**: shows all appeals with name, goal, and amounts asked, committed, received, and given. One appeal can be marked **Primary Appeal** (shown on the Dashboard and coaching pages). **Add Appeal** form: Appeal Name, Initial Goal, Letter Cost, Admin % (the Goal is calculated from these), then choose contacts to include by status(es) and tag(s), and exclusion rules: "Do not add contacts who": Have "Send Appeals" set to No, May have joined my team in the last 3 months, May have given a special gift in the last 3 months, May have increased their giving in the last 3 months, May have missed a gift in the last 30-90 days.
- **Appeal detail**: header with name, goal, progress bar, edit pencil, Delete Appeal. Two views: **Flows View** with columns Excluded, Asked, Committed, Received, Given (drag a contact between Asked, Committed, Received, Given to update their appeal status; dropping on Committed prompts for an Add Commitment dialog with Amount, Currency, Expected Date), and **List View** with tabs for the same statuses, showing Contact, Amount Committed, Donation(s), Regular Giving, and for excluded contacts the Reason. Actions: Add Contact to Appeal, Add Commitment, Edit Commitment, Remove Commitment, Remove Contact, Export Contacts, Export Emails, Export to CSV, and a "Review Excluded" then "Review Asked" first-time walkthrough (URL segment `/tour`).

### Contact fix tools

- **Fix Commitment Info**: "MPDX has assigned partnership statuses and giving frequencies" based on giving history. Each card shows the contact, the current status, and suggested Status, Amount, Currency, Frequency. Confirm to accept, edit the fields first if needed, or Hide the contact (sets status to Never Ask). Header: "You have N partner statuses to confirm."
- **Fix Mailing Addresses**: for contacts with several addresses, pick which is Primary (used for newsletter exports). You can Edit an address, Add Address, or bulk-confirm using "Default Primary Source" (for example, make the first address from a chosen source primary for every contact on the page).
- **Fix Send Newsletter**: "Financial, Special, and Prayer partners that have an empty Newsletter Status appear here." Choose Physical, Email, Both, or None per contact, or set all visible contacts at once.

### People fix tools

- **Fix Email Addresses** and **Fix Phone Numbers**: for people with several emails or phones, choose the primary, delete wrong ones, add a new one, or bulk-confirm by source. Headers: "You have N email addresses to confirm" / "You have N phone numbers to confirm".

### Merge tools

- **Merge Contacts**: "You have N possible duplicate contacts. This is sometimes caused when you imported data into MPDX." Each pair is shown side by side with created dates and details; choose **Left Wins the Merge** or **Right Wins the Merge** (or "Use this one"), or **Ignore this Duplicate**. Then **Confirm and Continue** or **Confirm and Leave**. "This cannot be undone." No data is lost; the losing record's information is folded into the winner.
- **Merge People**: the same flow for duplicate people inside contacts (for example a spouse entered twice).

### Imports

- **Import from CSV**: four steps. Step 1 Upload your CSV File (select file, size limit shown). Step 2 Map your headers (match each "Your CSV Header" to a "destination field": Contact Name, First Name, Last Name, Spouse, Greeting, Envelope Greeting, Street, City, State, Zip, Country, Region, Metro Area, Phone 1 to 3, Email 1 and 2, Status, Commitment (amount), Frequency, Currency, Newsletter, Likely to Give, Send Goals?, Church, Website, Notes, Tags, Connecting Partner, Relationship Code; or "Do Not Import"). You must include both First and Last Name or a Full Name; Street is required to import any address. Step 3 Map your values (match your spreadsheet's values for Status, Newsletter, Frequency, Likely to Give, Currency, and so on to MPDX values). Step 4 Preview, add "Tags to all imported contacts", tick "I accept that this import cannot be undone", then Import.
- **Import from Google**: Connect Google Account (or pick the "Account to Import From" if already connected). Choose "Import all contacts" (with a warning that this may import many unwanted contacts) or "Only import contacts from certain groups" and tick the Google groups/labels; add tags per group or for all imported contacts; choose whether the import should only fill blank fields or override all fields in existing contacts. The import runs in the background and emails when done.
- **Import from TntConnect**: instructions to export from TntConnect 3.2 or newer (File, Utilities, Maintenance, "Export Database to XML"), then Upload file, add tags for all imported contacts, and choose fill-blank-only or override. Imports can take up to 12 hours and an email is sent when complete. (A TntConnect DataSync file for donation data is uploaded separately under Connect Services, Organization.)

---

## 8. Settings and preferences

### Preferences

**Personal Preferences** (apply to the user across account lists):
- **Language**: the app's display language.
- **Locale**: number, date, and currency formatting.
- **Default Account**: which account list opens on sign-in.
- **Time Zone**.
- **Hour To Send Notifications**: the hour of day notification emails go out.

**Account Preferences** (apply to this account list):
- **Account Name**.
- **Monthly Goal**: the monthly support goal shown on the Dashboard ("Great progress comes from great goals!").
- **Geographic Location**: "Are you within 50 miles of a major city?" (used by goal tools; hidden for some staff).
- **Home Country**: "What country are you in?"
- **Default Currency**.
- **MPD Info**: Start Date, End Date, New Recurring Commitment Goal (used on the coaching pages for weeks on MPD and commitment goal).
- **Primary Organization**.
- **Early Adopter**: opt in to new features early (Yes/No).
- **Export All Data**: request a full export; shows "Your last export was on {date}".

Also a **Reset Welcome Tour** button that restarts the setup tour.

### Notifications

A table with one row per notification type (the list in section 1, item 5) and three columns: **In App**, **Email**, **Task** (create a task automatically). "select all" and "deselect all" per column; **Save Changes**.

### Connect Services (integrations)

- **Okta**: the sign-in provider; reminder that you must log into MPDX with your ministry email.
- **Organization**: "Add organizations that sync donation information with this MPDX account." Add Organization Account (organization, username, password where required; some organizations use OAuth), edit, or disconnect (removing stops future syncing but keeps past data). Also **Import TntConnect DataSync file** (.tntmpd or .tntdatasync) for organizations that provide donation data that way.
- **Google**: Connect a Google account, then per account: **Sync Calendar** (choose a calendar for MPDX to push tasks to; Enable/Disable Calendar Integration) and **Import contacts** (link to the Google import tool). Refresh, disconnect, or add another Google account.
- **MailChimp**: Connect Mailchimp, pick the "Mailchimp list to use for your newsletter" (MPDX keeps that list in sync with contacts set to receive the digital newsletter), and turn "Automatic logging of campaigns" on or off (logs sent campaigns as newsletter tasks). Disconnect available.
- **prayerletters.com**: Connect prayerletters.com Account, then **Sync Now** to replace the prayerletters.com list with the MPDX physical-newsletter list. Warning: syncing overwrites the entire prayerletters.com list, so make changes in MPDX. Refresh if the link stops working. Disconnect available.
- **Chalkline**: "Send my current Contacts to Chalkline" emails your newsletter list to Chalkline and opens their order form for printing and mailing physical newsletters.

### Manage Accounts

- **Manage Account Access**: "Invite someone to share this account" by email; lists who the account is currently shared with (Delete access) and who currently coaches it; **Pending Invites** with Delete invite.
- **Merge Your Accounts**: merge two of your own account lists (choose Merging From and Merging Into; requires confirming).
- **Merge Spouse Accounts**: instructions: 1. Share your accounts with each other. 2. Merge Accounts.

### Manage Coaches

**Manage Account Coaching Access**: invite a coach by email, see current coaches, remove a coach. A coach sees a read-only coaching view of the account (Coaching pages) rather than full access.

### Manage Organizations (organization admins only)

- **Impersonate & Share**: choose an organization you administer; **Impersonate User** (User Name, ID or Key/Relay Email plus a Reason / HelpScout Ticket Link); **Manage Organization Access**: invite someone to administer the organization, remove admins or invites.
- **Account Lists**: search account lists in the organization by name, email, or account number; expand to see Users, Coaches, Designation Accounts; Delete Account or Delete Admin/User with a reason.
- **Contacts**: search contacts in the organization by name, phone, email, or partner number; **Anonymize** a contact.

### Admin Console (MPDX admins and developers)

**Impersonate User** (Okta User Name / Email, Reason / HelpScout Ticket Link) and **Reset Account** (Account Name, Okta username, reason). Developers additionally see links to Backend Admin and Sidekiq.

---

## 9. Common "how do I" recipes

1. **Add a single new contact**: click the plus icon in the top bar, choose **Add Contact**, enter the name (and optionally address, phone, email, and status), Save. Or type the name in Search and choose "Create a new contact for ...".
2. **Add many contacts quickly**: plus icon, **Add Multiple Contacts**, fill a row per contact in the grid, Save.
3. **Import contacts from a spreadsheet**: MPDX Tools, **Import from CSV**. Step 1 upload the file; Step 2 map your column headers to MPDX fields; Step 3 map values such as status and frequency; Step 4 preview, add tags if wanted, accept that it cannot be undone, Import.
4. **Import from TntConnect**: in TntConnect choose File, Utilities, Maintenance, "Export Database to XML" and save the file. In MPDX go to MPDX Tools, **Import from TntConnect**, upload the file, add tags, choose fill-blank-fields or override, and submit. Expect an email when done (up to 12 hours).
5. **Import Google contacts**: MPDX Tools, **Import from Google**, connect your Google account, choose all contacts or specific groups/labels, add tags, submit.
6. **Record a gift by hand**: plus icon, **Add Donation**, choose the partner, amount, currency, date, designation, and method, Save. (Gifts from a connected organization arrive automatically.)
7. **Change a partner's status or commitment**: open the contact, click the pencil next to the status in the header (or **Edit Partnership** on the Donations tab), change Status, Commitment Amount, Frequency, and so on, Save. To change many at once, select them in the Contacts list and use Actions, **Edit Fields**.
8. **Change a status by dragging**: Contacts, click the **Column Workflow View** icon in the list header, drag the contact's card into the column for the new status.
9. **Find partners who are late on their commitment**: Contacts, open the filter panel, Commitment Details, **Late By**, pick a range (for example "More than 90 days late"). The Dashboard's Late Commitments list shows the same partners for this week.
10. **Find everyone who should get the physical newsletter**: Contacts, filter **Newsletter Recipients** to "Physical and Both" (and optionally Status to active partners). To export mailing labels, select all, Actions, **Export**, Export Contacts, choose PDF of Mail Merged Labels or CSV for Mail Merge.
11. **Get email addresses for a digital newsletter**: apply the Newsletter Recipients "Digital and Both" filter, select all, Actions, Export, **Export Emails**, then paste into your email program's Bcc field. Or connect MailChimp under Connect Services so the list syncs automatically.
12. **Record that a newsletter went out**: Dashboard, To Do This Week, **Log Newsletter**, choose Physical, Digital, or Both and the date; this logs a Partner Care newsletter task for every recipient.
13. **Schedule a call or appointment**: plus icon, **Add Task**, set Task Type (Initiation, Appointment, Follow Up, or Partner Care), Action (for example Phone Call), Contacts, Due Date, optionally a reminder, Save. It appears under Tasks and on the Dashboard when due.
14. **Log a call you already made**: plus icon, **Log Task** (or the "log task" button on the contact's Tasks tab), choose the action, the contact, the Result, optionally a Next Action, and a comment. If the result implies a new partner status, accept the suggested status change.
15. **Complete a task**: Tasks page (or the contact's Tasks tab), click the check-circle icon on the row, choose Result and Next Action, Save.
16. **Save a filter to reuse**: set up filters in the panel, click **Save Filter**, give it a name. It appears under Saved Filters in the panel from then on.
17. **Tag many contacts**: filter or search for them, select them, Actions, **Add Tags**, type or pick the tag. Remove with Actions, Remove Tags.
18. **Merge two duplicate contacts**: MPDX Tools, **Merge Contacts** shows detected duplicates; choose which side wins and Confirm. For two specific contacts, select both in the Contacts list and use Actions, **Merge**. A yellow duplicate warning in a contact's header also offers **See Match**.
19. **Hide or delete a contact**: open the contact, More Actions, **Hide Contact** (sets status Never Ask and hides it) or **Delete Contact** (permanent; not available for contacts that came from a donation system, contact Donation Services instead).
20. **Run a special-needs campaign (appeal)**: MPDX Tools, **Appeals**, fill in Add Appeal (name, initial goal, letter cost, admin percent, which statuses and tags to include, exclusion rules), Add Appeal. Open it, review the Excluded list, then move contacts from Asked to Committed, Received, Given as responses come in, and export the asked contacts for mailing.
21. **See what came in last month**: Reports, **Donations**, use Previous Month. For a per-partner view across the year, Reports, **14 Month Partner Report**.
22. **See how much to expect this month**: Reports, **Expected Monthly Total**.
23. **Share my account with a spouse or assistant**: Profile menu, **Manage Accounts**, Invite someone to share this account, enter their email. They accept from the emailed link. To give read-only coaching access instead, use **Manage Coaches**.
24. **Merge two account lists (for example spouses)**: both share their accounts with each other under Manage Accounts, then one uses **Merge Your Accounts**.
25. **Connect my donation system so gifts sync**: Profile menu, **Connect Services**, Organization, Add Organization Account, choose the organization and sign in.
26. **Push tasks to Google Calendar**: Connect Services, Google, connect your account, Sync Calendar, choose a calendar, Enable Calendar Integration.
27. **Change language, time zone, or monthly goal**: Profile menu, **Preferences**, open the matching accordion (Language, Time Zone under Personal Preferences; Monthly Goal under Account Preferences), Save.
28. **Choose which notifications I get**: Profile menu, **Notifications**, tick In App, Email, or Task per notification type, Save Changes. The hour emails are sent is under Preferences, Hour To Send Notifications.
29. **Fix wrong primary addresses, emails, or phones after an import**: MPDX Tools, **Fix Mailing Addresses**, **Fix Email Addresses**, **Fix Phone Numbers**; pick the primary per record or use the Default Primary Source bulk option, then Confirm.
30. **Set up flow columns for my process**: Contacts, switch to Column Workflow View, click **View Settings** in the header to open **Contact Flows Setup** (`.../contacts/flows/setup`); add or rename columns, drag statuses into them, or Reset to Defaults (US or Global), Confirm.

---

## 10. Glossary

- **Account list**: a workspace holding contacts, tasks, gifts, and settings for one missionary or couple. Users may have several and switch between them from the profile menu. Almost every URL is scoped to an account list.
- **Organization / organization account**: the ministry's donation system (for example Cru's) connected under Connect Services so that gifts, designation accounts, and donor records sync in automatically. Removing it stops future syncing but keeps past data.
- **Designation account**: the ministry account that gifts are credited to (a staff member may have more than one). Balances are shown in the Designation Accounts report and on the Dashboard.
- **Responsibility center / financial account**: for global staff, the financial accounts holding income and expenses, viewed under the Responsibility Centers report.
- **Staff account**: the Cru US payroll account linked to a user; needed for the Staff Expense report, Income/Expense Analysis, and most HR Tools.
- **Contact**: a household, individual, church, or company record. Each contact contains one or more **people** (for example husband and wife) with their own phones, emails, and birthdays, plus shared addresses, tags, notes, and partnership info.
- **Partnership info**: the giving relationship fields on a contact: status, commitment (pledge) amount, currency, frequency, whether the commitment has been received, start date, likely to give, newsletter, send appeals, next increase ask.
- **Commitment (pledge)**: the amount and frequency a partner has said they will give (for example 100 USD monthly). "Commitment Received" means the first gift toward it has arrived. **Pledge Status** filter: Outstanding, Completed, Pending. **Late** means a gift is overdue against the frequency; the app measures how many days late.
- **Pledge frequency options**: Weekly, Every 2 Weeks, Monthly, Every 2 Months, Quarterly, Every 4 Months, Every 6 Months, Annual, Every 2 Years.
- **Phases**: the partner journey MPDX uses to group statuses and task types: Connection, Initiation, Appointment, Follow-Up, Partner Care, Archive.
- **Partner statuses** (by phase):
  - Connection: New Connection (never contacted), Ask in Future, Research Contact Info, Cultivate Relationship
  - Initiation: Initiate for Appointment (contact for appointment)
  - Appointment: Appointment Scheduled
  - Follow-Up: Follow Up for Decision (call for decision)
  - Partner Care: Partner - Financial (gives regularly), Partner - Special (gives one-time or special gifts), Partner - Pray (prays but does not give)
  - Archive: Not Interested, Unresponsive, Never Ask, Research Abandoned, Expired Connection (expired referral)
  Filters also offer "-- All Active --" (not archived and not hidden), "-- All Hidden --", and "-- None --" (no status set). Hiding a contact sets its status to Never Ask.
- **Likely To Give**: Least Likely, Likely, Most Likely; used by the Expected Monthly Total report to sort possible gifts.
- **Newsletter (send newsletter)**: how a contact receives your newsletter: Physical (mail), Email (digital), Both, or None. Filters phrase these as Physical and Both, Digital and Both, Physical Only, Digital Only, Both Only. People can individually be marked "Opt-out of Digital Newsletter". MailChimp syncs the digital list; prayerletters.com and Chalkline handle the physical list.
- **Send Appeals**: a yes/no on each contact controlling whether they are included in new appeals.
- **Appeal**: a one-time fundraising campaign with a goal (initial goal plus letter cost plus admin percent). Contacts move through appeal statuses Excluded, Asked, Committed, Received (gift received but not yet processed), Given (processed). The **Primary Appeal** is featured on the Dashboard and coaching pages.
- **Task / activity**: a to-do or a record of contact with a partner, with a phase, action type, subject, due date, result, and comments. "Log Task" records something already done; "Add Task" schedules something. **Next Action** creates the follow-up task when completing one.
- **Result**: the outcome recorded when completing a task, which can drive a suggested status change (for example Appointment result "Partner - Financial").
- **Tags**: free-form labels on contacts and on tasks, used for filtering, bulk actions, appeals, and the coaching tag summaries.
- **Connections / referrals**: partners that another contact introduced you to. The **Connecting Partner** (referrer) is recorded on the new contact; the Connections tab lists who a contact has referred. "Expired Connection" is the archive status for a referral that never went anywhere.
- **Starred**: a per-contact and per-task favorite flag with a quick filter in list headers.
- **Assignee**: the user (in a shared account list) responsible for a contact or task.
- **Coaching / coach**: a person given read-only visibility of an account list's progress via the Coaching pages (balance, commitments, activity, weekly reports). Set up under Manage Coaches; the Coaching nav item appears for the coach.
- **Weekly report**: a set of organization-defined questions a missionary answers each week from the Dashboard; answers show on the coaching page.
- **Notifications**: alerts about partner behaviour (started giving, missed a gift, larger or smaller gift, birthdays, and so on) delivered in-app, by email, or as an automatically created task, depending on settings.
- **Fix tools**: Fix Commitment Info, Fix Mailing Addresses, Fix Send Newsletter, Fix Email Addresses, Fix Phone Numbers: data clean-up screens that surface records needing a decision, with counts shown as badges in the Tools menu.
- **Merge**: combining two duplicate contacts (or two duplicate people) into one record; the "winner" keeps its identity and absorbs the other's information.
- **Tnt / TntConnect**: desktop MPD software many users migrate from; its XML export can be imported under Tools, and its DataSync donation files can be uploaded under Connect Services, Organization.
- **MPD Info**: start date, end date, and new recurring commitment goal stored in Account Preferences, used to compute "Weeks on MPD" and goals on coaching pages.
- **Monthly Goal**: the target monthly support amount shown on the Dashboard; set in Account Preferences (or produced by the MPD Goal Calculator for US staff).
- **Impersonation**: an admin viewing MPDX as another user for support, with a required reason; "Stop Impersonating" appears in the profile menu while active.
- **Early Adopter**: a preference to receive new features before general release.
- **Helpjuice**: the help center behind the floating help beacon and the Contact Us support form.

---

## Sources

Derived from the mpdx-react repository (Next.js pages router) and, for filter names, the mpdx_api repository. Main files consulted:

- README.md, CLAUDE.md, src/components/HrTools/CLAUDE.md
- pages/**/*.page.tsx (all user-facing routes), pages/_document.page.tsx, pages/_app.page.tsx, pages/helpjuice.css
- src/components/Layouts/Primary/TopBar/TopBar.tsx and Items/{NavMenu,AddMenu,SearchMenu,NotificationMenu,ProfileMenu}; src/components/Layouts/Primary/NavBar/*
- src/hooks/useNavPages.tsx, useReportNavItems.ts, useToolsNavItems.ts, useSettingsNavItems.ts, useHrToolsNavItems.ts
- src/components/Helpjuice/Helpjuice.tsx
- src/components/Shared/UrlFiltersProvider/UrlFiltersProvider.tsx, src/components/Shared/ContactPanelProvider/ContactPanelProvider.tsx, pages/accountLists/[accountListId]/contacts/ContactsWrapper.tsx, src/components/Contacts/ContactsContext/ContactsContext.tsx, src/components/Shared/Header/ListHeader.tsx
- src/components/Shared/Filters/* (FilterPanel, FilterList, TagsSection), src/components/Shared/MassActions/*, src/components/Contacts/MassActions/Exports/*
- src/components/Contacts/ContactFlow/* (including contactFlowDefaultOptions.ts and ContactFlowSetup), src/components/Contacts/ContactsMap/*
- src/components/Contacts/ContactDetails/* (ContactDetailTab.ts, ContactDetailsHeader, ContactDetailsTab, ContactTasksTab, ContactDonationsTab, ContactReferralTab, ContactNotesTab)
- src/components/Task/Modal/TaskModal.tsx and Modal/Form/*, src/components/Task/TaskRow/*, src/lib/tasks/taskFilterTabs.ts
- src/components/Constants/LoadConstantsMock.ts and src/hooks/useContactPartnershipStatuses.ts (phase, status, activity type, and result labels)
- src/graphql/types.generated.ts (StatusEnum, PhaseEnum, ActivityTypeEnum, ResultEnum, DisplayResultEnum, PledgeFrequencyEnum, SendNewsletterEnum, LikelyToGiveEnum, PreferredContactMethodEnum, NotificationTypeTypeEnum, UserTypeEnum, UserSetupStageEnum, ContactFilterSetInput, TaskFilterSetInput)
- src/components/Dashboard/* (Balance, DonationHistories, MonthlyGoal, ThisWeek, Welcome)
- src/components/Reports/* (DonationsReport, FourteenMonthReports, StaffExpenseReport, MPGAIncomeExpensesReport, DesignationAccountsReport, FinancialAccountsReport, ExpectedMonthlyTotalReport, PartnerGivingAnalysisReport), src/components/DonationTable/*
- src/components/Tool/* (Appeal, FixCommitmentInfo, FixMailingAddresses, FixSendNewsletter, FixEmailAddresses, FixPhoneNumbers, MergeContacts, MergePeople, Import, GoogleImport, TntConnect), pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper.tsx
- src/components/Coaching/* (CoachingList, CoachingDetail and its sections)
- src/components/Settings/* (preferences/accordions, notifications, integrations/{Google,Mailchimp,Prayerletters,Okta,Organization,Chalkline}, Accounts, Coaches, Organization, Admin), src/components/Shared/Forms/Accordions/AccordionEnum.ts
- src/components/Setup/* (SetupProvider, Connect), pages/setup/*, pages/accountLists/[accountListId]/setup/finish.page.tsx, pages/acceptInvite.page.tsx
- src/components/HrTools/* (page titles and descriptions)
- mpdx_api: app/services/contact/filter/*.rb and app/services/task/filter/*.rb (filter titles, group headings, and option labels)
