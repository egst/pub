vim.diagnostic.config({
    underline = true, -- Enable underlining
    virtual_text = true, -- Display diagnostics as inline virtual text
    signs = true, -- Show diagnostics in the side gutter
    severity_sort = true, -- Sort diagnostics by severity
})

return {
    lsp            = true,
    treeSitter     = true,

    langServers = {
        ts_ls = {},
        eslint = {},
    },
}
