## Development

```bash
cp env.example .env

# fill those env vars in .env

bun run -F ext dev
```

## Configuration

The extension now supports runtime configuration through the Settings page. Users can configure:

1. **API URL** - Custom API endpoint URL (defaults to env var `VITE_API_BASE_URL`)
2. **API Key** - API key for authentication (defaults to env var `VITE_API_KEY`)
3. **Model** - AI model selection (defaults to `gemini-2.5-flash-preview-09-2025`)
4. **Thinking Mode** - Enable/disable thinking mode for supported models

To access settings:
- Click the extension icon in your browser
- Click the "⚙️ 设置" button
- Or right-click the extension icon and select "Options"

## Publish

For Chrome only

1. Bump verion in `package.json`
2. Build and zip

    ```bash
    bun run build
    bun run zip
    ````

3. Go to the _Chrome Web Store Developer Dashbaord_ page of the extension. Select "Upload new package". Select the zip file named like `ext-x.x.x-chrome.zip` from the `.output` dir.
