const json = {
    "title ": "Two Sum Challenge",
        "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            "difficulty": "easy",
                "tags": ["arrays", "hashing"],
                    "VisibletestCases": [
                        {
                            "input": "nums = [2,7,11,15], target = 9",
                            "output": "[0,1]",
                            "explaination": "Because nums[0] + nums[1] == 9, we return [0, 1]."
                        }
                    ],
                        "InvisibletestCases": [
                            {
                                "input": "nums = [3,2,4], target = 6",
                                "output": "[1,2]"
                            }
                        ],
                            "BoilerplateCode": [
                                {
                                    "language": "cpp",
                                    "startingCode": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};"
                                },
                                {
                                    "language": "java",
                                    "startingCode": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}"
                                },
                                {
                                    "language": "python",
                                    "startingCode": "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass"
                                },
                                {
                                    "language": "javascript",
                                    "startingCode": "function twoSum(nums, target) {\n    \n};"
                                }
                            ],
                                "createdBy": "65c2a1b3e4b0f123456789ab",
                                    "ReferenceSolution": [
                                        {
                                            "languge": "cpp",
                                            "code": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> mp;\n        for (int i = 0; i < nums.size(); i++) {\n            int complement = target - nums[i];\n            if (mp.count(complement)) return {mp[complement], i};\n            mp[nums[i]] = i;\n        }\n        return {};\n    }\n};"
                                        },
                                        {
                                            "languge": "java",
                                            "code": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) return new int[] { map.get(complement), i };\n            map.put(nums[i], i);\n        }\n        return new int[] {};\n    }\n}"
                                        },
                                        {
                                            "languge": "python",
                                            "code": "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        mapping = {}\n        for i, num in enumerate(nums):\n            complement = target - num\n            if complement in mapping:\n                return [mapping[complement], i]\n            mapping[num] = i"
                                        },
                                        {
                                            "languge": "javascript",
                                            "code": "function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) return [map.get(complement), i];\n        map.set(nums[i], i);\n    }\n};"
                                        }
                                    ]
}