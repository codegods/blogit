from typing import Any, List


def flatten(lst: List[List[Any]]) -> list:
    """
    Recursively flattens a list.
    >>> flatten([[1,2,3], 4, [5, 6, 7]])
    [1, 2, 3, 4, 5, 6, 7]
    >>> flatten([1, [2, [3, 4]]])
    [1, 2, 3, 4]
    """
    r_lst = []
    for elem in lst:
        if type(elem) == list or type(elem) == tuple:
            r_lst.extend(flatten(elem))
        else:
            r_lst.append(elem)

    return r_lst
