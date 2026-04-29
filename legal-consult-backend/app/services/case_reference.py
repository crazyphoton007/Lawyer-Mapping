from uuid import UUID


def derive_case_reference(request_id: UUID) -> str:
    value = str(request_id)
    hashed = 0
    for char in value:
        hashed = (hashed * 31 + ord(char)) & 0xFFFFFFFF
    return f"CF-{str(hashed % 100000).zfill(5)}"
