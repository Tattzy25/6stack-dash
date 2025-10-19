"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyIcon, EmptyTitle } from "@/components/ui/empty"
import { useGlobalControl } from "@/components/global-control-provider"

export type Transaction = { id: string; user?: string; amount?: number; currency?: string; status?: string }
export type TokenPack = { id: string; name?: string; tokens?: number; price?: number }

export type MarketplaceManagerProps = {
  transactions?: Transaction[]
  packs?: TokenPack[]
}

export function MarketplaceManager({ transactions = [], packs = [] }: MarketplaceManagerProps) {
  const { logEvent } = useGlobalControl()

  function click(name: string) {
    logEvent(`marketplace:${name}`)
  }

  return (
    <div className="px-4 lg:px-6 grid grid-cols-1 gap-4">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Transactions</CardTitle>
          <CardDescription>All payments and history</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {transactions.map((t) => (
                <div key={t.id} className="border rounded-md p-3">
                  <div className="font-medium">{t.user ?? "Unknown"}</div>
                  <div className="text-sm text-muted-foreground">{t.amount ?? 0} {t.currency ?? "USD"}</div>
                  <div className="text-sm text-muted-foreground">Status: {t.status ?? "-"}</div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => click(`refund:${t.id}`)}>Refund</Button>
                    <Button size="sm" variant="outline" onClick={() => click(`details:${t.id}`)}>Details</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty className="border mt-6">
              <EmptyIcon />
              <EmptyHeader>
                <EmptyTitle>No transactions</EmptyTitle>
                <EmptyDescription>Connect payment provider to view data.</EmptyDescription>
              </EmptyHeader>
              <div className="mt-4">
                <Button variant="outline" onClick={() => click("transactions_refresh")}>Refresh</Button>
              </div>
            </Empty>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Token Packs</CardTitle>
          <CardDescription>Manage pricing and availability</CardDescription>
        </CardHeader>
        <CardContent>
          {packs.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {packs.map((p) => (
                <div key={p.id} className="border rounded-md p-3">
                  <div className="font-medium">{p.name ?? "Pack"}</div>
                  <div className="text-sm text-muted-foreground">{p.tokens ?? 0} tokens</div>
                  <div className="text-sm text-muted-foreground">Price: {p.price ?? 0}</div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => click(`pack_edit:${p.id}`)}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => click(`pack_disable:${p.id}`)}>Disable</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty className="border mt-6">
              <EmptyIcon />
              <EmptyHeader>
                <EmptyTitle>No token packs</EmptyTitle>
                <EmptyDescription>Create packs to sell tokens.</EmptyDescription>
              </EmptyHeader>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={() => click("pack_create")}>Create Pack</Button>
                <Button variant="outline" onClick={() => click("pricing_update")}>Update Pricing</Button>
              </div>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  )
}