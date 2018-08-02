# set value

`!mo =<val>`

sets the momentum to the value given by `<val>`, ex: to set to 3 use `!mo =3`

# add momentum

`!mo +<val>`

adds the number of momentum specified by `<val>`, ex: to add 2 use `!mo +2`

# use momentum

`!mo -<val>`

uses or removes the number of momentum specified by `<val>`, ex: to use 1 use `!mo -1`

# maths momentum

`!mo +-1+4-2`
`!mo -1+4-2`

both will correctly evaluate `-1 + 4 - 2 = 1` and add one to the current value

`!mo =-1+4-2`

will also correctly evaluate to `1` but simply set the current value to `1`
