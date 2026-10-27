1. Open the spreadsheet: https://docs.google.com/spreadsheets/d/1G437Uou1EjQh1WtdYyt3ray4gU52qapG38gbPSflhuw/edit
2. Open Extensions > Apps Script.
3. Replace the script content with google-apps-script/code.gs (same as code.ts in the project root).
4. Save, then (optional) run `setupSheets` once and approve permissions.
   The "RSVP" and "Wishes" tabs are created with headers automatically either way.
5. Click Deploy > New deployment > type: Web app.
6. Execute as: Me. Who has access: Anyone.
7. Deploy and copy the Web App URL (ends in /exec).
8. In the project root, create .env (see .env.example):

VITE_GOOGLE_APPS_SCRIPT_URL=YOUR_WEB_APP_URL

9. On Vercel, add the same variable under Project Settings > Environment Variables, then redeploy.
10. Restart the Vite dev server locally.

Sheets:
- RSVP:   Timestamp | Name | Phone | Attendance | Guests | Notes | Invited As
- Wishes: Timestamp | Name | Message

Wishes are stored only in the sheet; they are not displayed on the invitation.
If you change the Apps Script later, use Deploy > Manage deployments > Edit > New version.
