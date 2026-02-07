import random

N_FEATURES = 939

genotype_features = [
    round(random.uniform(-1, 1), 4)
    for _ in range(N_FEATURES)
]

# In ra đúng 939 số, ngăn cách bằng dấu phẩy
output = ",".join(map(str, genotype_features))

print(output)
