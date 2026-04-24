# ============================================================
# ui.R — Top-level UI definition
# ============================================================
# Assembles all page modules into a single-page bslib app.
# Authentication state determines which page is shown.

ui <- page_fluid(
  theme = bs_theme(
    version  = 5,
    bootswatch = "flatly",
    primary  = "#2C7A4B",   # ecology-themed green
    font_scale = 0.95
  ),

  useShinyjs(),
  useToastr(),

  {
    asset_version <- format(Sys.time(), "%Y%m%d%H%M%S")
    tags$head(
      tags$link(rel = "stylesheet", href = paste0("custom.css?v=", asset_version)),
      tags$script(src = paste0("tooltips.js?v=", asset_version))
    )
  },

  # ---- Page router ------------------------------------------
  # uiOutput toggles between the login page and the app shell
  # based on session state (managed in server.R).
  uiOutput("page_router")
)
