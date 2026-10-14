
FROM node:22-alpine

WORKDIR /app

RUN corepack enable

# Workspace manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/database/package.json packages/database/package.json

# Install workspace dependencies
RUN pnpm install --frozen-lockfile

# Copy the remaining monorepo files
COPY . .

# Prisma 7 config requires DATABASE_URL during generation.
# This is only a build-time placeholder; Compose supplies the runtime URL.
RUN DATABASE_URL="postgresql://snap:snap_password@localhost:5432/snap?schema=public" pnpm db:generate

# Compile the API
RUN pnpm --filter @snap/api build

EXPOSE 3000

CMD ["pnpm", "--filter", "@snap/api", "start"]
