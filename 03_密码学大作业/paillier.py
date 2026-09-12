from math import gcd
import prime_utils
import random

def lcm(a,b):#lcm = a * b // gcd(a, b)
   res : int =a*b//gcd(a,b)
   return res

def L(x, n): # 返回 (x - 1) // n
    return (x-1)//n

def key(bits: int = 512):
    p = prime_utils.gen_prime(bits)
    q=prime_utils.gen_prime(bits)
    if p==q:
        q=prime_utils.gen_prime(bits)
    n=p*q
    lam=lcm(p-1,q-1)
    g=n+1
    u=pow(lam,-1,n)
    miyao = (p, q, n, lam, g, u)
    return miyao
keys=key()
def encrypt(m:int,k=keys):#E(m)=g^m·r^n mod n²
    miyao=k
    r = random.randint(1,100000)
    n2 = miyao[2] * miyao[2]
    c = (pow(miyao[4], m, n2) * pow(r, miyao[2], n2)) % n2
    return c
def decrypt(c:int,k=keys ):
    miyao=k
    n2 = miyao[2] * miyao[2]
    m = (L(pow(c, miyao[3], n2), miyao[2]) * miyao[5]) % miyao[2]
    return m

def add_cipher(c1, c2):          # 密文相加
    return (c1 * c2) % keys[2] ** 2

def mul_cipher(c, k):            # 密文乘
    return pow(c, k, keys[2] ** 2)

#test
if __name__ == "__main__":
    a, b = 128, 256
    ca, cb = encrypt(a), encrypt(b)

    # ① 同态加法：E(a)·E(b) 解密 == a+b
    print("同态加法 :", decrypt(add_cipher(ca, cb)) == a + b)

    # ② 标量乘法：E(a)^3 解密 == 3a
    print("标量乘法 :", decrypt(mul_cipher(ca, 3)) == 3 * a)

    # ③ 负数：E(a) · E(-a) 应等于 1 (mod n²)，解密为 0
    c_neg = pow(ca, -1, keys[2] ** 2)          # E(-a) = E(a)⁻¹
    print("负数逆元 :", decrypt((ca * c_neg) % keys[2] ** 2) == 0)