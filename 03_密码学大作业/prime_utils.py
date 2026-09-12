import random
from itertools import count

SMALL_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47,
                53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113]
def is_probable_prime(n: int, rounds: int = 40) -> bool:
    # 边界
    if n%2==0:
        return False
    if n==2:
        return True

    #快速过滤
    for i in SMALL_PRIMES :
        if n%i==0 :
            return n==i


    # 分解 n-1 = d * 2^s
    temp=n-1
    s=0
    while temp%2==0:
        s=s+1
        temp=temp//2
    d=temp
    #循环 rounds 轮：
    #a = random.randint(2, n - 2)
    #x = pow(a, d, n)
    #若 x == 1 或 x == n - 1 则本轮通过
    #再连续平方 s-1 次：x = x * x % n，一旦 x == n-1 → 本轮通过
    #循环结束还没通过 False
    for _ in range(rounds):
        a = random.randint(2, n - 2)
        x = pow(a, d, n)
        if x == 1 or x == n - 1:
            continue
        for _ in range(s - 1):
            x = x * x % n
            if x == n - 1:
                break
        else:
            return False  # 终止
    return True  # rounds 轮全部通过即素数

def gen_prime(bits: int = 512) -> int:
    while True:
        cand = random.randint(2 ** (bits - 1), 2 ** bits - 1) | 1
        if is_probable_prime(cand):
            return cand

if __name__ == "__main__":
    p = gen_prime()
    print(f"p = {p}")