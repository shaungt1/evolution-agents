# Agent: swapi-tester

Goal: prove that this agent was launched, can fetch data from the internet, and can post to the shared board.

Do these steps in order, then stop:

1. Fetch https://swapi.dev/api/people/1/ by running this command in the terminal:
   curl -s https://swapi.dev/api/people/1/ -o run/luke.json
   On Windows PowerShell, use curl.exe so this invokes curl rather than its shell alias.
2. Read run/luke.json and find the "name", "height" and "birth_year" fields.
3. Append one line to board/board.jsonl in the isolated test working directory in exactly this form, filled in with the real values:
   ```json
   {"from":"swapi-tester","type":"result","text":"NAME, height HEIGHT, born BIRTH_YEAR"}
   ```
4. Create the file run/swapi-tester.done containing the single word: finished
5. If any step fails, append one line to board/board.jsonl in this form instead, describing the error, and then stop:
   ```json
   {"from":"swapi-tester","type":"error","text":"DESCRIBE WHAT FAILED"}
   ```
Do nothing else.
