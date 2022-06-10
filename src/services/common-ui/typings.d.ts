declare namespace API {
  type CurrentUser = {
    name?: string;
    avatar?: string;
    email?: string;
    signature?: string;
    title?: string;
    group?: string;
    tags?: { key?: string; label?: string }[];
    notifyCount?: number;
    unreadCount?: number;
    country?: string;
    access?: string;
  };

  type ErrorResponse = {
    /** Flag for retrieving falsiness */
    success?: boolean;
    /** Error contents from the relevant system */
    errorMessage?: string;
  };

  type LoginParams = {
    email?: string;
    password?: string;
  };

  type LoginResult = {
    /** Flag for retrieving falsiness */
    success?: boolean;
    email?: string;
    /** Role groups the user belongs to */
    groups?: Record<string, any>;
    isAdmin?: boolean;
  };
}
