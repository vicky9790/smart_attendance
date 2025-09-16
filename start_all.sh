
# Optional helper script (unix) - run from project root
echo "Start server:"
(cd server && npm install)
echo "Start client:"
(cd client && npm install)
echo "Done. Start server with: cd server && npm start"
