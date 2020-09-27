import screen

cols = screen.Colors()
for i in dir(cols)[:26]:
    val = cols.__getattribute__(i)
    print(i, "=", f"({round(val[0]*1000/255)}, {round(val[1]*1000/255)}, {round(val[2]*1000/255)})")