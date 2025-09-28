# app/models/__init__.py
# Import modules (side-effect: models register with Base.metadata).
# Do NOT import classes to avoid circular imports.
from . import user        # noqa: F401
from . import lawyer      # noqa: F401
from . import article     # noqa: F401
from . import request     # noqa: F401
from . import payment     # noqa: F401
from . import attachment  # noqa: F401
# from app.schemas import RequestCreate, RequestOut
