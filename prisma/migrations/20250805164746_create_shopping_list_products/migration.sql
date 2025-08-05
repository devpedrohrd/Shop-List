-- CreateTable
CREATE TABLE "public"."_ShoppingListProducts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ShoppingListProducts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ShoppingListProducts_B_index" ON "public"."_ShoppingListProducts"("B");

-- AddForeignKey
ALTER TABLE "public"."_ShoppingListProducts" ADD CONSTRAINT "_ShoppingListProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ShoppingListProducts" ADD CONSTRAINT "_ShoppingListProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."ShoppingList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
