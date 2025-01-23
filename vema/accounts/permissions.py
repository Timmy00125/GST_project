from rest_framework import permissions


class IsAdminUserOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admin users to create/edit/delete,
    but allow read-only access to others.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:  # GET, HEAD, OPTIONS
            return True
        return request.user and request.user.is_staff  # Check for admin status
