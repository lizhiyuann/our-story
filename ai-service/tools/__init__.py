from .base import ApiClient
from .memory_tools import save_memory, search_memory, get_user_preferences
from .mood_tools import get_recent_moods, record_mood
from .countdown_tools import get_countdowns, create_countdown
from .timeline_tools import get_timeline, record_event
from .preference_tools import update_user_preference

ALL_TOOLS = [
    save_memory,
    search_memory,
    get_user_preferences,
    get_recent_moods,
    record_mood,
    get_countdowns,
    create_countdown,
    get_timeline,
    record_event,
    update_user_preference,
]

TOOL_MAP = {t.name: t for t in ALL_TOOLS}
