# Outlook AnyFetch Provider
> Visit http://anyfetch.com for details about AnyFetch.

AnyFetch provider for mails stored in Outlook Office 365 

# How to install?
Clone the repo, then `npm install`.
Create a `keys.sh` file on the directory root:

You'll need to define some environment variables

```sh
# Go to https://manage.windowsazure.com/
export OUTLOOK_API_ID="outlook-app-id"
export OUTLOOK_API_ID="outlook-app-secret"

# Your provider URL, most probably http://your-host
export PROVIDER_URL="url-for-callback"

# AnyFetch app id and secret
export ANYFETCH_API_ID="anyfetch-app-id"
export ANYFETCH_API_SECRET="anyfetch-app-secret"
```

# How does it works?
AnyFetch Core will call `/init/connect` with anyfetch Oauth-tokens. The user will be transparently redirected to Office365 consentment page.
Office365 will then call us back on `/init/callback` with a `code` parameter. We'll trade the `code` for an `access_token` and a `refresh_token` and store it in the database, along with the AnyFetch tokens.

We can now sync data between Outlook Office365 and AnyFetch.

This is where the `upload` handler comes into play.
The function will retrieve, for all the accounts, the mail created since the last run, and upload the data to AnyFetch.

Support: `support@anyfetch.com`.

