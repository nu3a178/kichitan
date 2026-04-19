-- CreateTable
CREATE TABLE "Estate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "rent_price" INTEGER NOT NULL,
    "fee_info" TEXT NOT NULL,
    "geo_code" TEXT NOT NULL,
    "img" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "floor_plan" TEXT NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "years_old" INTEGER NOT NULL,
    "floor_num" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Estate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prefecture" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "zoom" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Prefecture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrefectureTrainLine" (
    "id" SERIAL NOT NULL,
    "prefecture_code" TEXT NOT NULL,
    "train_line_code" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PrefectureTrainLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Station" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "zoom" INTEGER NOT NULL,
    "prefecture_code" TEXT NOT NULL,
    "line_code" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainLine" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "zoom" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "TrainLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prefecture_code_key" ON "Prefecture"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Station_code_key" ON "Station"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TrainLine_code_key" ON "TrainLine"("code");

-- AddForeignKey
ALTER TABLE "PrefectureTrainLine" ADD CONSTRAINT "PrefectureTrainLine_prefecture_code_fkey" FOREIGN KEY ("prefecture_code") REFERENCES "Prefecture"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrefectureTrainLine" ADD CONSTRAINT "PrefectureTrainLine_train_line_code_fkey" FOREIGN KEY ("train_line_code") REFERENCES "TrainLine"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station" ADD CONSTRAINT "Station_line_code_fkey" FOREIGN KEY ("line_code") REFERENCES "TrainLine"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station" ADD CONSTRAINT "Station_prefecture_code_fkey" FOREIGN KEY ("prefecture_code") REFERENCES "Prefecture"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
