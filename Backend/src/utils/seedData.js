const DEFAULT_PROBLEMS = [
  {
    title: "Two Sum",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\n**Example 1:**\n```\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n```",
    difficulty: "easy",
    tags: "array",
    visibleTestCases: [
      { input: "2 7 11 15\n9", output: "[0,1]", explaination: "nums[0] + nums[1] = 2 + 7 = 9" },
      { input: "3 2 4\n6", output: "[1,2]", explaination: "nums[1] + nums[2] = 2 + 4 = 6" }
    ],
    hiddenTestCases: [
      { input: "3 3\n6", output: "[0,1]" }
    ],
    startCode: [
      { language: "js", initialCode: "function twoSum(nums, target) {\n  // Write your solution here\n}" },
      { language: "python", initialCode: "def twoSum(nums, target):\n    # Write your solution here\n    pass" },
      { language: "cpp", initialCode: "#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your solution here\n}" },
      { language: "java", initialCode: "public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}" }
    ],
    referenceSolution: [
      { language: "js", completeCode: "const fs = require('fs');\nconst input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');\nconst nums = input[0].split(' ').map(Number);\nconst target = Number(input[1]);\nconst map = new Map();\nfor (let i = 0; i < nums.length; i++) {\n  const diff = target - nums[i];\n  if (map.has(diff)) {\n    console.log(JSON.stringify([map.get(diff), i]));\n    process.exit(0);\n  }\n  map.set(nums[i], i);\n}" }
    ]
  },
  {
    title: "Reverse String",
    description: "Write a function that reverses a string. The input string is given as an array of characters.\n\n**Example 1:**\n```\nInput: s = \"hello\"\nOutput: \"olleh\"\n```",
    difficulty: "easy",
    tags: "string",
    visibleTestCases: [
      { input: "hello", output: "olleh", explaination: "Reversed 'hello' is 'olleh'" },
      { input: "Hannah", output: "hannaH", explaination: "Reversed 'Hannah' is 'hannaH'" }
    ],
    hiddenTestCases: [
      { input: "SolveIt", output: "tIvloS" }
    ],
    startCode: [
      { language: "js", initialCode: "function reverseString(s) {\n  // Write your solution here\n}" },
      { language: "python", initialCode: "def reverseString(s):\n    # Write your solution here\n    pass" },
      { language: "cpp", initialCode: "#include <string>\nusing namespace std;\n\nstring reverseString(string s) {\n    // Write your solution here\n}" }
    ],
    referenceSolution: [
      { language: "js", completeCode: "const fs = require('fs');\nconst s = fs.readFileSync('/dev/stdin', 'utf-8').trim();\nconsole.log(s.split('').reverse().join(''));" }
    ]
  },
  {
    title: "Palindrome Number",
    description: "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.\n\nAn integer is a palindrome when it reads the same backward as forward.\n\n**Example 1:**\n```\nInput: x = 121\nOutput: true\n```",
    difficulty: "easy",
    tags: "math",
    visibleTestCases: [
      { input: "121", output: "true", explaination: "121 reads as 121 from left to right and right to left." },
      { input: "-121", output: "false", explaination: "From left to right, it reads -121. From right to left, it becomes 121-." }
    ],
    hiddenTestCases: [
      { input: "10", output: "false" }
    ],
    startCode: [
      { language: "js", initialCode: "function isPalindrome(x) {\n  // Write your solution here\n}" },
      { language: "python", initialCode: "def isPalindrome(x):\n    # Write your solution here\n    pass" }
    ],
    referenceSolution: [
      { language: "js", completeCode: "const fs = require('fs');\nconst xStr = fs.readFileSync('/dev/stdin', 'utf-8').trim();\nconst rev = xStr.split('').reverse().join('');\nconsole.log(xStr === rev ? 'true' : 'false');" }
    ]
  },
  {
    title: "Valid Parentheses",
    description: "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n\n**Example 1:**\n```\nInput: s = \"()[]{}\"\nOutput: true\n```",
    difficulty: "easy",
    tags: "stack",
    visibleTestCases: [
      { input: "()[]{}", output: "true", explaination: "All brackets match correctly" },
      { input: "(]", output: "false", explaination: "'(' and ']' do not match" }
    ],
    hiddenTestCases: [
      { input: "({[]})", output: "true" }
    ],
    startCode: [
      { language: "js", initialCode: "function isValid(s) {\n  // Write your solution here\n}" }
    ],
    referenceSolution: [
      { language: "js", completeCode: "const fs = require('fs');\nconst s = fs.readFileSync('/dev/stdin', 'utf-8').trim();\nconst stack = [];\nconst map = { ')': '(', '}': '{', ']': '[' };\nlet valid = true;\nfor (let char of s) {\n  if (map[char]) {\n    if (stack.pop() !== map[char]) { valid = false; break; }\n  } else {\n    stack.push(char);\n  }\n}\nif (stack.length !== 0) valid = false;\nconsole.log(valid ? 'true' : 'false');" }
    ]
  },
  {
    title: "Maximum Subarray",
    description: "Given an integer array `nums`, find the subarray with the largest sum, and return *its sum*.\n\n**Example 1:**\n```\nInput: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: The subarray [4,-1,2,1] has the largest sum 6.\n```",
    difficulty: "medium",
    tags: "dp",
    visibleTestCases: [
      { input: "-2 1 -3 4 -1 2 1 -5 4", output: "6", explaination: "[4,-1,2,1] sum is 6" },
      { input: "1", output: "1", explaination: "Single element" }
    ],
    hiddenTestCases: [
      { input: "5 4 -1 7 8", output: "23" }
    ],
    startCode: [
      { language: "js", initialCode: "function maxSubArray(nums) {\n  // Write your solution here\n}" }
    ],
    referenceSolution: [
      { language: "js", completeCode: "const fs = require('fs');\nconst nums = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(' ').map(Number);\nlet maxSum = nums[0];\nlet currentSum = nums[0];\nfor (let i = 1; i < nums.length; i++) {\n  currentSum = Math.max(nums[i], currentSum + nums[i]);\n  maxSum = Math.max(maxSum, currentSum);\n}\nconsole.log(maxSum);" }
    ]
  },
  {
    title: "Binary Search",
    description: "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.\n\n**Example 1:**\n```\nInput: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4\n```",
    difficulty: "easy",
    tags: "array",
    visibleTestCases: [
      { input: "-1 0 3 5 9 12\n9", output: "4", explaination: "9 exists at index 4" },
      { input: "-1 0 3 5 9 12\n2", output: "-1", explaination: "2 does not exist" }
    ],
    hiddenTestCases: [
      { input: "5\n5", output: "0" }
    ],
    startCode: [
      { language: "js", initialCode: "function search(nums, target) {\n  // Write your solution here\n}" }
    ],
    referenceSolution: [
      { language: "js", completeCode: "const fs = require('fs');\nconst input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');\nconst nums = input[0].split(' ').map(Number);\nconst target = Number(input[1]);\nlet left = 0, right = nums.length - 1;\nlet res = -1;\nwhile (left <= right) {\n  let mid = Math.floor((left + right) / 2);\n  if (nums[mid] === target) { res = mid; break; }\n  else if (nums[mid] < target) left = mid + 1;\n  else right = mid - 1;\n}\nconsole.log(res);" }
    ]
  },
  {
    title: "Valid Anagram",
    description: "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.\n\n**Example 1:**\n```\nInput: s = \"anagram\", t = \"nagaram\"\nOutput: true\n```",
    difficulty: "easy",
    tags: "string",
    visibleTestCases: [
      { input: "anagram\nnagaram", output: "true", explaination: "Letters match frequency" },
      { input: "rat\ncar", output: "false", explaination: "Letters differ" }
    ],
    hiddenTestCases: [
      { input: "listen\nsilent", output: "true" }
    ],
    startCode: [
      { language: "js", initialCode: "function isAnagram(s, t) {\n  // Write your solution here\n}" }
    ],
    referenceSolution: [
      { language: "js", completeCode: "const fs = require('fs');\nconst [s, t] = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');\nconst sSort = s.split('').sort().join('');\nconst tSort = t.split('').sort().join('');\nconsole.log(sSort === tSort ? 'true' : 'false');" }
    ]
  },
  {
    title: "Fibonacci Number",
    description: "The Fibonacci numbers, commonly denoted `F(n)` form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from `0` and `1`.\n\nGiven `n`, calculate `F(n)`.\n\n**Example 1:**\n```\nInput: n = 4\nOutput: 3\nExplanation: F(4) = F(3) + F(2) = 2 + 1 = 3.\n```",
    difficulty: "easy",
    tags: "dp",
    visibleTestCases: [
      { input: "4", output: "3", explaination: "F(4) = 3" },
      { input: "2", output: "1", explaination: "F(2) = 1" }
    ],
    hiddenTestCases: [
      { input: "6", output: "8" }
    ],
    startCode: [
      { language: "js", initialCode: "function fib(n) {\n  // Write your solution here\n}" }
    ],
    referenceSolution: [
      { language: "js", completeCode: "const fs = require('fs');\nconst n = Number(fs.readFileSync('/dev/stdin', 'utf-8').trim());\nif (n <= 1) { console.log(n); process.exit(0); }\nlet a = 0, b = 1;\nfor (let i = 2; i <= n; i++) {\n  let temp = a + b;\n  a = b;\n  b = temp;\n}\nconsole.log(b);" }
    ]
  }
];

module.exports = { DEFAULT_PROBLEMS };
