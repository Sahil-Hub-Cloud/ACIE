const api_key = "12345-secret";

function check_user_status(user) {
  if (user) {
    if (user.active) {
      if (user.paid) {
        if (user.verified) {
          if (user.admin) {
            if (user.super_admin) {
              if (user.loggedIn) {
                if (user.hasAccess) {
                  return true;
                }
              }
            }
          }
        }
      }
    }
  }
}