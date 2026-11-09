// Twelve fixed hand-authored boards. Authoring source: scripts/level-specs.js.
export const levels = [
  {
    "id": 1,
    "name": [
      "拐个弯，送到家",
      "A turn for home"
    ],
    "tip": [
      "点击圆形路标，改成右转。A 去珊瑚站，B 去青绿站。",
      "Tap the round sign to turn right. A goes to coral; B goes to teal."
    ],
    "hint": [
      "A 到路口后需要右转。",
      "A needs a right turn at the junction."
    ],
    "rows": [
      ".......",
      "#######",
      "....#..",
      "....#..",
      ".......",
      "#######",
      "......."
    ],
    "starts": [
      {
        "x": 0,
        "y": 1,
        "dir": 1
      },
      {
        "x": 0,
        "y": 5,
        "dir": 1
      }
    ],
    "depots": [
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 6,
        "y": 5
      }
    ],
    "pads": [],
    "solution": {
      "routes": {
        "4,1": "R"
      },
      "waits": {}
    }
  },
  {
    "id": 2,
    "name": [
      "错峰十字街",
      "Crossing paths"
    ],
    "tip": [
      "直行是相对车头的方向。两辆车可穿过同一个路口。",
      "Straight follows each van’s heading. Both vans can cross one junction."
    ],
    "hint": [
      "保持直行。B 会比 A 早一拍通过。",
      "Keep straight. B crosses one beat before A."
    ],
    "rows": [
      ".......",
      "...#...",
      "...#...",
      "#######",
      "...#...",
      "...#...",
      "...#..."
    ],
    "starts": [
      {
        "x": 0,
        "y": 3,
        "dir": 1
      },
      {
        "x": 3,
        "y": 1,
        "dir": 2
      }
    ],
    "depots": [
      {
        "x": 6,
        "y": 3
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "pads": [],
    "solution": {
      "routes": {
        "3,3": "S"
      },
      "waits": {}
    }
  },
  {
    "id": 3,
    "name": [
      "请等一拍",
      "After you"
    ],
    "tip": [
      "点击虚线等待垫。开启后，驶入的车会停一拍。",
      "Tap the dashed waiting pad. When on, an arriving van stays for one beat."
    ],
    "hint": [
      "打开 A 前方的等待垫，让 B 先过。",
      "Turn on A’s waiting pad so B crosses first."
    ],
    "rows": [
      "...#...",
      "...#...",
      "...#...",
      "#######",
      "...#...",
      "...#...",
      "...#..."
    ],
    "starts": [
      {
        "x": 0,
        "y": 3,
        "dir": 1
      },
      {
        "x": 3,
        "y": 0,
        "dir": 2
      }
    ],
    "depots": [
      {
        "x": 6,
        "y": 3
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "pads": [
      "1,3"
    ],
    "solution": {
      "routes": {
        "3,3": "S"
      },
      "waits": {
        "1,3": true
      }
    }
  },
  {
    "id": 4,
    "name": [
      "邻里小巷",
      "Neighbourhood lanes"
    ],
    "tip": [
      "路口按车头左转或右转。只有两条路的弯道会自动转弯。",
      "Signs turn relative to the van. Two-way corners bend automatically."
    ],
    "hint": [
      "两个路口都右转，接下来的弯道会自动带你到站。",
      "Set both junctions to right. The next corners bend toward the depots."
    ],
    "rows": [
      ".......",
      "######.",
      "..#....",
      "###.###",
      "....#..",
      ".######",
      "......."
    ],
    "starts": [
      {
        "x": 0,
        "y": 1,
        "dir": 1
      },
      {
        "x": 6,
        "y": 5,
        "dir": 3
      }
    ],
    "depots": [
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 6,
        "y": 3
      }
    ],
    "pads": [],
    "solution": {
      "routes": {
        "2,1": "R",
        "4,5": "R"
      },
      "waits": {}
    }
  },
  {
    "id": 5,
    "name": [
      "环路会车",
      "The passing loops"
    ],
    "tip": [
      "面对面交换位置也会相撞。试试街道两边的绕行路。",
      "Swapping places head-on is a collision too. Try the two passing loops."
    ],
    "hint": [
      "两个路标都左转，车辆就会各走一条绕行路。",
      "Set both signs to left. Each van takes its own loop."
    ],
    "rows": [
      ".......",
      "..###..",
      "..#.#..",
      "#######",
      "..#.#..",
      "..###..",
      "......."
    ],
    "starts": [
      {
        "x": 0,
        "y": 3,
        "dir": 1
      },
      {
        "x": 6,
        "y": 3,
        "dir": 3
      }
    ],
    "depots": [
      {
        "x": 6,
        "y": 3
      },
      {
        "x": 0,
        "y": 3
      }
    ],
    "pads": [],
    "solution": {
      "routes": {
        "2,3": "L",
        "4,3": "L"
      },
      "waits": {}
    }
  },
  {
    "id": 6,
    "name": [
      "两次相遇",
      "Twice across"
    ],
    "tip": [
      "B 会两次穿过 A 的街道。数清共享节拍再发车。",
      "B crosses A’s road twice. Count the shared beats before dispatch."
    ],
    "hint": [
      "两处路口保持直行，只开启一个等待垫。",
      "Keep both junctions straight and enable exactly one waiting pad."
    ],
    "rows": [
      "....#..",
      "..#.#..",
      "..#.#..",
      "#######",
      "..#.#..",
      "..###..",
      "......."
    ],
    "starts": [
      {
        "x": 0,
        "y": 3,
        "dir": 1
      },
      {
        "x": 2,
        "y": 1,
        "dir": 2
      }
    ],
    "depots": [
      {
        "x": 6,
        "y": 3
      },
      {
        "x": 4,
        "y": 0
      }
    ],
    "pads": [
      "1,3",
      "2,2"
    ],
    "solution": {
      "routes": {
        "2,3": "S",
        "4,3": "S"
      },
      "waits": {
        "1,3": true,
        "2,2": false
      }
    }
  },
  {
    "id": 7,
    "name": [
      "公园外环",
      "Around the park"
    ],
    "tip": [
      "等待或绕路都能改变到达时刻。选择安全的一条。",
      "A wait or a detour changes arrival time. Find a safe route."
    ],
    "hint": [
      "最短路线：所有路口直行，开启 A 的等待垫。也有绕行解。",
      "Shortest route: all straight, A’s pad on. Detour solutions exist too."
    ],
    "rows": [
      "...#...",
      ".#####.",
      ".#.#.#.",
      "#######",
      ".#.#.#.",
      ".#####.",
      "...#..."
    ],
    "starts": [
      {
        "x": 0,
        "y": 3,
        "dir": 1
      },
      {
        "x": 3,
        "y": 0,
        "dir": 2
      }
    ],
    "depots": [
      {
        "x": 6,
        "y": 3
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "pads": [
      "2,3"
    ],
    "solution": {
      "routes": {
        "3,1": "S",
        "1,3": "S",
        "3,3": "S",
        "5,3": "S",
        "3,5": "S"
      },
      "waits": {
        "2,3": true
      }
    }
  },
  {
    "id": 8,
    "name": [
      "山形小径",
      "The winding lane"
    ],
    "tip": [
      "B 沿小径折返穿街；A 的一次停留会改变两个路口的时序。",
      "B winds back across the street. One wait changes the timing at both crossings."
    ],
    "hint": [
      "先保持所有路口直行，看看谁在第几个节拍经过。",
      "Keep the crossing signs straight and compare their arrival beats."
    ],
    "rows": [
      ".#.....",
      ".#.###.",
      ".#.#.#.",
      "#######",
      ".#.#.#.",
      ".###.#.",
      ".....#."
    ],
    "starts": [
      {
        "x": 0,
        "y": 3,
        "dir": 1
      },
      {
        "x": 1,
        "y": 0,
        "dir": 2
      }
    ],
    "depots": [
      {
        "x": 6,
        "y": 3
      },
      {
        "x": 5,
        "y": 6
      }
    ],
    "pads": [
      "1,2",
      "3,2"
    ],
    "solution": {
      "routes": {
        "1,3": "S",
        "3,3": "S",
        "5,3": "S"
      },
      "waits": {
        "1,2": false,
        "3,2": false
      }
    }
  },
  {
    "id": 9,
    "name": [
      "仓库转运",
      "Depot transfer"
    ],
    "tip": [
      "字母也要匹配。经过别人的仓库会立刻停下。",
      "Match the letter too. Entering the other depot stops the run."
    ],
    "hint": [
      "A 先从中路北上，B 从中路南下后再找向西的出口。",
      "Send A north along the middle avenue; B turns south, then looks for the west exit."
    ],
    "rows": [
      "...#...",
      "#######",
      ".#.#.#.",
      ".#####.",
      ".#.#.#.",
      "#######",
      "...#..."
    ],
    "starts": [
      {
        "x": 0,
        "y": 1,
        "dir": 1
      },
      {
        "x": 6,
        "y": 5,
        "dir": 3
      }
    ],
    "depots": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 0,
        "y": 1
      }
    ],
    "pads": [
      "2,3",
      "4,3"
    ],
    "solution": {
      "routes": {
        "1,1": "S",
        "3,1": "L",
        "5,1": "S",
        "1,3": "S",
        "3,3": "S",
        "5,3": "S",
        "1,5": "S",
        "3,5": "R",
        "5,5": "S"
      },
      "waits": {
        "2,3": false,
        "4,3": false
      }
    }
  },
  {
    "id": 10,
    "name": [
      "中央广场",
      "Town square"
    ],
    "tip": [
      "三条横街与两条纵路。先找出口，再安排谁先通过。",
      "Three streets, two avenues. Plan the exits, then the crossing order."
    ],
    "hint": [
      "A 沿右侧纵路下行，B 沿左侧纵路上行，在中间横街各自左转。",
      "Send A down the right avenue, B up the left. Both turn left onto the middle street."
    ],
    "rows": [
      ".......",
      "#######",
      "..#.#..",
      "#######",
      "..#.#..",
      "#######",
      "......."
    ],
    "starts": [
      {
        "x": 0,
        "y": 1,
        "dir": 1
      },
      {
        "x": 6,
        "y": 5,
        "dir": 3
      }
    ],
    "depots": [
      {
        "x": 6,
        "y": 3
      },
      {
        "x": 0,
        "y": 3
      }
    ],
    "pads": [
      "1,1",
      "5,5"
    ],
    "solution": {
      "routes": {
        "2,1": "S",
        "4,1": "R",
        "2,3": "S",
        "4,3": "L",
        "2,5": "S",
        "4,5": "R"
      },
      "waits": {
        "1,1": false,
        "5,5": false
      }
    }
  },
  {
    "id": 11,
    "name": [
      "一桥之隔",
      "Across the bridge"
    ],
    "tip": [
      "中间只有一条连接路。绕行距离与等待要一起考虑。",
      "One link joins the two sides. Balance detour distance and waiting."
    ],
    "hint": [
      "两车不能迎面占用桥。让其中一车绕外侧环路延后到达。",
      "Avoid meeting on the bridge. Delay one van with an outside loop."
    ],
    "rows": [
      ".......",
      "###.###",
      "#.#.#.#",
      "#######",
      "#.#.#.#",
      "###.###",
      "......."
    ],
    "starts": [
      {
        "x": 0,
        "y": 1,
        "dir": 1
      },
      {
        "x": 6,
        "y": 5,
        "dir": 3
      }
    ],
    "depots": [
      {
        "x": 6,
        "y": 1
      },
      {
        "x": 0,
        "y": 1
      }
    ],
    "pads": [
      "1,3",
      "5,3"
    ],
    "solution": {
      "routes": {
        "0,3": "L",
        "2,3": "R",
        "4,3": "L",
        "6,3": "S"
      },
      "waits": {
        "1,3": false,
        "5,3": false
      }
    }
  },
  {
    "id": 12,
    "name": [
      "最后一班快递",
      "The final dispatch"
    ],
    "tip": [
      "最后一次：规划三次穿越、正确出口与共享节拍。",
      "One last plan: three crossings, matching exits, and a shared clock."
    ],
    "hint": [
      "A 要向右侧青绿路径绕行至底部的 A 站；B 要在横街向右转至 B 站。",
      "Route A to its bottom depot via the right-hand lane; turn B onto the street to its B depot."
    ],
    "rows": [
      ".#.....",
      ".#####.",
      ".#.#.#.",
      "#######",
      ".#.#.#.",
      ".#####.",
      ".....#."
    ],
    "starts": [
      {
        "x": 0,
        "y": 3,
        "dir": 1
      },
      {
        "x": 1,
        "y": 0,
        "dir": 2
      }
    ],
    "depots": [
      {
        "x": 5,
        "y": 6
      },
      {
        "x": 6,
        "y": 3
      }
    ],
    "pads": [
      "2,3",
      "3,2",
      "5,4"
    ],
    "solution": {
      "routes": {
        "1,1": "L",
        "3,1": "S",
        "1,3": "S",
        "3,3": "R",
        "5,3": "L",
        "3,5": "L",
        "5,5": "R"
      },
      "waits": {
        "2,3": false,
        "3,2": false,
        "5,4": false
      }
    }
  }
];
