import pyproj
import sys
def convert(x, y, mode):
    if mode == 'T':
        proj = pyproj.Transformer.from_crs(3035, 4326, always_xy=True)
    elif mode == 'F':
        proj = pyproj.Transformer.from_crs(4326, 3035, always_xy=True)  # lat and long are inverted
    else:
        return 0,0
    return proj.transform(x, y)

if __name__ == "__main__":
    x1, y1 = sys.argv[1], sys.argv[2]
    mode = sys.argv[3]
    x2, y2 = convert(x1, y1, mode)
    sys.stdout.write(", ".join(map(str,(x2,y2))))