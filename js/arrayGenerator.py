import random

def generate_extended_grid(n):
    extended_size = n * 2 - 1
    extended_grid = []

    for row in range(extended_size):
        grid_row = []
        for col in range(extended_size):
            if row % 2 == 0 and col % 2 == 0:
                # Both row and col are even
                value = random.choices([''] + [str(x) for x in range(1, n + 1)], weights=[0.7] + [0.3 / n] * n, k=1)[0]
            elif (row % 2 == 0 and col % 2 == 1) or (row % 2 == 1 and col % 2 == 0):
                # Either row or col is even, the other is odd
                value = random.choices(['^', '>', 'v', '<', ''], weights=[0.2, 0.2, 0.2, 0.2, 0.2], k=1)[0]
            else:
                # Both row and col are odd
                value = ''
            grid_row.append(value)
        extended_grid.append(grid_row)

    return extended_grid

size = 6
grid = generate_extended_grid(size)

for i, row in enumerate(grid):
    print(row, end='')
    if i < len(grid) - 1:
        print(',')
