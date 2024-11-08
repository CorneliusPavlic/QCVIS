import json
import numpy as np
import matplotlib.pyplot as plt

# Load the JSON data from the file
with open('kawasaki.json', 'r') as file:
    data = json.load(file)

# Initialize lists for nodes and edges
nodes = []
edges = []

# Set print options to avoid wrapping lines
np.set_printoptions(threshold=np.inf, linewidth=200, precision=2, suppress=True)



# Step 1: Extract nodes and edges from the data
for i in range(len(data["qubits"])):
    node_id = str(i)
    nodes.append(int(node_id))

for gate in data["gates"]:
    if "qubits" in gate and len(gate["qubits"]) == 2:
        qubit1, qubit2 = map(str, gate["qubits"])
        edge = tuple(sorted((int(qubit1), int(qubit2))))
        edges.append(edge)



print(edges)
# Define the grid size
GRID_SIZE = 20
grid = np.full((GRID_SIZE, GRID_SIZE), -1)  # -1 indicates an empty position

# Starting position for placing nodes
x, y = 0, 0
grid[0,0] = 0

def recursive(node, edges, grid, x, y, visited=None):
    # Initialize visited set on the first call
    if visited is None:
        visited = set()

    # Mark the current node as visited
    visited.add(node)
    
    for edge in edges:
        if node in edge:
            # Forward connection
            if node == edge[0] and edge[1] not in visited:
                if edge[1] == node + 1:
                    grid[y, x + 1] = edge[1]
                    recursive(edge[1], edges, grid, x + 1, y, visited)
                else:
                    grid[y + 1, x] = edge[1]
                    recursive(edge[1], edges, grid, x, y + 1, visited)

            # Backward connection
            elif node == edge[1] and edge[0] not in visited:
                if edge[0] == node - 1:
                    grid[y, x - 1] = edge[0]
                    recursive(edge[0], edges, grid, x - 1, y, visited)
                    
recursive(node=0, edges=edges, grid=grid, x=0, y=0)
print(grid)


# Visualization of the grid
plt.figure(figsize=(12, 12))
for i in range(GRID_SIZE):
    for j in range(GRID_SIZE):
        if grid[i, j] != -1:  # If there's a node
            plt.scatter(j, -i, s=500, color='blue', edgecolor='black', zorder=2)
            plt.text(j, -i, str(grid[i, j]), ha='center', va='center', fontsize=12, color='white', zorder=3)




# Draw edges with 90-degree connections
for edge in edges:
    source, target = edge
    src_index = int(source)
    tgt_index = int(target)

    # Find positions for the nodes in the grid
    src_pos = np.argwhere(grid == src_index)
    tgt_pos = np.argwhere(grid == tgt_index)

    if src_pos.size > 0 and tgt_pos.size > 0:  # Ensure both nodes are in the grid
        src_pos = src_pos[0]
        tgt_pos = tgt_pos[0]

        # Draw the connection maintaining 90-degree angles
        if src_pos[0] != tgt_pos[0]:  # If in different rows
            # Draw vertical connection
            plt.plot([src_pos[1], src_pos[1]], [-src_pos[0], -tgt_pos[0]], color='lightblue', linewidth=2, zorder=1)
            # Then draw horizontal connection
            plt.plot([src_pos[1], tgt_pos[1]], [-tgt_pos[0], -tgt_pos[0]], color='lightblue', linewidth=2, zorder=1)
        else:  # If in the same row, just connect them directly
            plt.plot([src_pos[1], tgt_pos[1]], [-src_pos[0], -tgt_pos[0]], color='lightblue', linewidth=2, zorder=1)

# Adjust plot settings
plt.xlim(-1, GRID_SIZE)
plt.ylim(-GRID_SIZE, 1)
plt.axis('off')
plt.title("Grid Layout of Nodes with 90-degree Connections")
plt.show()



# [('106', '107'), ('49', '55'), ('58', '59'), ('54', '64'), ('72', '81'), ('91', '98'), ('123', '124'), ('22', '23'), ('16', '26'), ('30', '31'), ('35', '47'), ('33', '39'), ('43', '44'), ('53', '60'), ('68', '69'), ('78', '79'), ('73', '85'), ('88', '89'), ('102', '92'), ('109', '114'), ('111', '122'), ('5', '6'), ('15', '4'), ('16', '8'), ('12', '17'), ('20', '33'), ('24', '34'), ('28', '35'), ('50', '51'), ('41', '53'), ('45', '54'), ('66', '73'), ('71', '77'), ('62', '72'), ('87', '88'), ('83', '92'), ('96', '97'), ('104', '111'), ('100', '110'), ('2', '3'), ('10', '9'), ('17', '30'), ('14', '18'), ('26', '27'), ('39', '40'), ('34', '43'), ('47', '48'), ('52', '56'), ('59', '60'), ('63', '64'), ('67', '68'), ('77', '78'), ('81', '82'), ('85', '86'), ('90', '94'), ('97', '98'), ('101', '102'), ('105', '106'), ('114', '115'), ('118', '119'), ('122', '123'), ('1', '2'), ('6', '7'), ('10', '11'), ('15', '22'), ('18', '19'), ('25', '26'), ('29', '30'), ('38', '39'), ('42', '43'), ('46', '47'), ('36', '51'), ('56', '57'), ('60', '61'), ('64', '65'), ('55', '68'), ('74', '89'), ('76', '77'), ('80', '81'), ('84', '85'), ('94', '95'), ('98', '99'), ('102', '103'), ('106', '93'), ('113', '114'), ('117', '118'), ('121', '122'), ('125', '126'), ('0', '14'), ('3', '4'), ('7', '8'), ('11', '12'), ('20', '21'), ('24', '25'), ('28', '29'), ('32', '36'), ('40', '41'), ('44', '45'), ('48', '49'), ('37', '52'), ('58', '71'), ('62', '63'), ('66', '67'), ('70', '74'), ('79', '80'), ('83', '84'), ('87', '93'), ('75', '90'), ('109', '96'), ('100', '99'), ('103', '104'), ('116', '117'), ('120', '121'), ('124', '125'), ('0', '1'), ('4', '5'), ('8', '9'), ('12', '13'), ('19', '20'), ('23', '24'), ('27', '28'), ('31', '32'), ('37', '38'), ('41', '42'), ('45', '46'), ('49', '50'), ('57', '58'), ('61', '62'), ('65', '66'), ('69', '70'), ('75', '76'), ('79', '91'), ('82', '83'), ('86', '87'), ('95', '96'), ('100', '101'), ('104', '105'), ('112', '126'), ('115', '116'), ('119', '120'), ('110', '118'), ('21', '22'), ('107', '108'), ('108', '112')]



# [  0   1   2   3   4   5   6   7   8   9  10  11  12  13  -1  -1  -1  -1 -1  -1]
# [ 14  -1  -1  -1  15  -1  -1  -1  16  -1  -1  -1  17  -1  -1  -1  -1  -1 -1  -1]
# [ 18  19  20  21  22  23  24  25  26  27  28  29  30  31  32  -1  -1  -1 -1  -1]
# [ -1  -1  33  -1  -1  -1  34  -1  -1  -1  35  -1  -1  -1  36  -1  -1  -1 -1  -1]
# [ -1  -1  39  40  41  42  43  44  45  46  47  48  49  50  51  -1  -1  -1 -1  -1]
# [ -1  -1  -1  -1  53  -1  -1  -1  54  -1  -1  -1  55  -1  -1  -1  -1  -1 -1  -1]
# [ -1  -1  -1  -1  60  61  62  63  64  65  66  67  68  69  70  -1  -1  -1 -1  -1]
# [ -1  -1  -1  -1  -1  -1  72  -1  -1  -1  73  -1  -1  -1  74  -1  -1  -1 -1  -1]
# [ -1  -1  -1  -1  -1  -1  81  82  83  84  85  86  87  88  89  -1  -1  -1 -1  -1]
# [ -1  -1  -1  -1  -1  -1  -1  -1  92  -1  -1  -1  93  -1  -1  -1  -1  -1 -1  -1]
# [ -1  -1  -1  -1  -1  -1  -1  -1 102 103 104 105 106 107 108  -1  -1  -1 -1  -1]
# [ -1  -1  -1  -1  -1  -1  -1  -1  -1  -1 111  -1  -1  -1 112  -1  -1  -1 -1  -1]
# [ -1  -1  -1  -1  -1  -1  -1  -1  -1  -1 122 123 124 125 126  -1  -1  -1 -1  -1]
# [ -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1 -1  -1]
# [ -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1 -1  -1]
# [ -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1 -1  -1]
# [ -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1 -1  -1]
# [ -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1 -1  -1]
# [ -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1 -1  -1]
# [ -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1  -1 -1  -1]]