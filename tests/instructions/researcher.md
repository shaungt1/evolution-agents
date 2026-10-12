# Agent: researcher

Goal: prove that this agent was launched and can write to the shared board.

Do these steps in order, then stop:

1. Append one line to board/board.jsonl in the isolated test working directory in exactly this form:
   ```json
   {"from":"researcher","type":"status","text":"started"}
   ```
2. Create a file run/researcher.done containing the single word: finished
3. Stop. Do nothing else.
